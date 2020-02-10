import toArray from 'lodash-es/toArray';
import {
    animationFrameScheduler,
    fromEvent,
    merge,
    Subject,
} from 'rxjs';
import {
    filter,
    map,
    take,
    takeUntil,
    tap,
    throttleTime,
} from 'rxjs/operators';

import { UiGridColumnDirective } from '../../body/ui-grid-column.directive';
import { IGridDataEntry } from '../../models';
import {
    cellSelector,
    findHeaderIndexFor,
    getProperty,
    resizeFilter,
    toPercentageStyle,
} from './resize-manager.constants';
import {
    IResizeEvent,
    IResizeInfo,
    IResizeState,
    ResizableGrid,
    ResizeDirection,
} from './types';

/**
 * @internal
 * @ignore
 */
export abstract class ResizeManager<T extends IGridDataEntry> {
    public isResizing = false;
    public current?: IResizeInfo<T>;

    protected set _resizeEvent(ev: MouseEvent) {
        if (!this.current) { return; }

        const value = Math.round(ev.clientX - this.current.dragInitX!);

        // compute the current direction and determine if it has changed
        const direction = value > this._previous!.offsetPx ? ResizeDirection.Right : ResizeDirection.Left;
        const isDirectionChanged = this._direction !== direction;

        // if a direction change occured
        // get the next neighbour
        if (isDirectionChanged) {
            this._direction = direction;
            this._neighbourIndexOffset = 0;
        }

        const nextEvent: IResizeEvent<T> = {
            previous: this._previous!,
            current: {
                resized: this.current,
                neighbour: this._getResizedPairAt(this.current.index + direction + this._neighbourIndexOffset),
                oppositeNeighbour: this._getResizedPairAt(this.current.index + -direction),
                offsetPx: value,
                offsetPercent: Math.round(value / this._table!.clientWidth * 1000),
                direction: direction,
                event: ev,
            },
        };

        this._resize$.next(nextEvent);
    }

    protected abstract _stateFilter: (state: IResizeEvent<T>) => boolean;
    protected abstract _resizeLeftFilter: (state: IResizeEvent<T>) => boolean;
    protected abstract _resizeRightFilter: (state: IResizeEvent<T>) => boolean;
    protected abstract _stateUpdate: (state: IResizeEvent<T>) => void;

    protected _neighbourIndexOffset = 0;

    protected _headers?: HTMLDivElement[];
    protected _table?: HTMLTableElement | null;
    protected _definitions?: UiGridColumnDirective<T>[];

    private _previous?: IResizeState<T> = {} as IResizeState<T>;
    private _direction?: ResizeDirection;
    private _resize$ = new Subject<IResizeEvent<T>>();
    private _stopped$ = new Subject<void>();
    private _widthMap = new Map<string, number>();
    private _gridElement: HTMLDivElement;

    constructor(
        private _grid: ResizableGrid<T>,
    ) {
        this._gridElement = _grid['_ref'].nativeElement;

        merge(
            _grid.rendered,
            _grid['_columnChanges$'],
        ).pipe(
            map(() => {
                this._table = this._gridElement.querySelector<HTMLTableElement>('.ui-grid-container');
                this._definitions = _grid.columns.filter(c => c.resizeable && c.visible);

                return this._headers = toArray<HTMLDivElement>(this._gridElement.querySelectorAll('.ui-grid-resizeable'));
            }),
            map((headers, i) => {
                if (_grid.toggleColumns || i > 0) { return; }

                const headerWidth = headers.reduce(
                    (acc, curr) => acc + (parseInt(curr.style.width!, 10) || 0),
                    0,
                ) / 10;

                if (
                    headerWidth < 100 &&
                    !!headers.length
                ) {
                    console.warn(`Table header sum is currently ${headerWidth} ( < 100 ) please update column definitions.`);
                }
            }),
            takeUntil(_grid['_destroyed$']),
        ).subscribe();
    }

    public handleResize = (ev: MouseEvent) => this._resizeEvent = ev;

    public startResize(ev: MouseEvent, column: UiGridColumnDirective<T>) {
        this.isResizing = true;
        // hook events
        this.setupState(ev, column);

        const defaultView = this._gridElement.ownerDocument!.defaultView!;

        const mouseUp$ = fromEvent(defaultView, 'mouseup')
            .pipe(
                take(1),
                takeUntil(this._stopped$),
            );

        mouseUp$.subscribe(() => this.stop());

        fromEvent<MouseEvent>(defaultView, 'mousemove')
            .pipe(
                throttleTime(16, animationFrameScheduler),
                takeUntil(this._stopped$),
            )
            .subscribe(moveEv => this.handleResize(moveEv));

        // detection is required in order to update cell resize state
        this._grid['_cd'].detectChanges();
        this._grid['_cd'].detach();
    }

    public stop() {
        this._stopped$.next();
        this.endResize();
        this.isResizing = false;

        // detection is required in order to update cell resize state
        this._grid['_cd'].reattach();
        this._grid['_cd'].detectChanges();
    }

    public setupState(ev: MouseEvent, column: UiGridColumnDirective<T>) {
        this.current = {} as IResizeInfo<T>;
        this.current.index = findHeaderIndexFor(this._headers!, column.identifier);
        this.current = Object.assign(this.current, {
            column: column,
            element: this._headers![this.current.index],
            cells: this._getCellsFor(column.identifier),
        });

        this._startResizeCommon(ev);

        this._resize$
            .pipe(
                filter(resizeFilter),
                tap((state: IResizeEvent<T>) => {
                    // after filtering non-events
                    // records previous states for event consistency
                    this._previous = state.current;
                }),
                filter(this._stateFilter),
                filter(this._resizeRightFilter),
                filter(this._resizeLeftFilter),
            )
            .subscribe(this._stateUpdate);
    }

    public endResize() {
        this._endResizeCommon(this.current!, this._previous!.neighbour, this._previous!.oppositeNeighbour);
        this.current = undefined;
        this._direction = NaN;
    }

    public destroy() {
        this._stopped$.complete();
        this._resize$.complete();
        this._widthMap.clear();

        this.current = undefined;

        this._previous = undefined;
        this._headers = undefined;
        this._table = undefined;
        this._definitions = undefined;
    }

    protected _getResizedPairAt(index: number): IResizeInfo<T> | undefined {
        const element = this._headers![index];

        if (!element) { return; }

        const property = getProperty(element);

        const column = this._definitions!.find(d => d.identifier === property)!;

        return {
            element,
            column,
            index,
            cells: this._getCellsFor(property),
        };
    }

    protected _simulateStopFor(ev: MouseEvent | undefined, ...neighbours: Array<IResizeInfo<T> | undefined>) {
        this._endResizeCommon(...neighbours);
        this._startResizeCommon(ev);
    }

    protected _applyOffsetFor(entry: IResizeInfo<T> | undefined, offset: number) {
        if (!entry) { return; }

        const width = entry.column.width as number + offset;
        this._widthMap.set(entry.column.identifier, width);
        entry.element.style.width = toPercentageStyle(width);

        entry.cells.forEach(cell => cell.style.width = toPercentageStyle(width));
    }

    private _getCellsFor = (property: string) => toArray<HTMLDivElement>(
        this._gridElement
            .querySelectorAll(cellSelector(property)),
    )

    private _startResizeCommon(ev?: MouseEvent) {
        if (!ev) { return; }

        this._previous = Object.assign(this._previous, {
            offsetPx: 0,
        });
        this.current!.dragInitX = ev.clientX;
    }

    private _endResizeCommon(...entries: Array<IResizeInfo<T> | undefined>) {
        entries.forEach(entry => {
            if (!entry) { return; }

            const width = this._widthMap.get(entry.column.identifier)!;
            entry.column.width = width / 10;
            entry.element.style.width = toPercentageStyle(width);
        });
        this._previous = {} as IResizeState<T>;
    }
}

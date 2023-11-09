import toArray from 'lodash-es/toArray';
import {
    animationFrameScheduler,
    fromEvent,
    interval,
    merge,
    Subject,
} from 'rxjs';
import {
    debounceTime,
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
    ResizeEmission,
} from './types';

/**
 * @internal
 * @ignore
 */
export abstract class ResizeManager<T extends IGridDataEntry> {
    isResizing = false;
    current?: IResizeInfo<T>;
    resizeEnd$ = new Subject<IResizeInfo<T> | undefined>();
    resizeStart$ = new Subject<{ columnIndex: number; mouseEvent?: MouseEvent; direction?: 'left' | 'right' }>();
    resize$ = new Subject<Map<string, number>>();
    previousClientX = 0;
    resizeEmissions$ = new Subject<ResizeEmission>();

    protected set _resizeEvent(ev: MouseEvent) {
        if (!this.current) { return; }

        const value = ev.clientX - this.current.dragInitX!;
        if (!this.previousClientX) {
            // TODO: move this to startResize
            this.previousClientX = ev.clientX;
        }
        // compute the current direction and determine if it has changed
        const direction = value > this._previous!.offsetPx ? ResizeDirection.Right : ResizeDirection.Left;
        const isDirectionChanged = this._direction !== direction;

        // if a direction change occured
        // get the next neighbour
        if (isDirectionChanged) {
            this._direction = direction;
            this._neighbourIndexOffset = 0;
        }

        const pixelsToPercentRatio = this._computePixelsToPercentRatio();
        const offsetPercent = value * pixelsToPercentRatio;

        const nextEvent: IResizeEvent<T> = {
            previous: this._previous!,
            current: {
                resized: this.current,
                neighbour: this._getResizedPairAt(this.current.index + direction + this._neighbourIndexOffset),
                oppositeNeighbour: this._getResizedPairAt(this.current.index + -direction),
                offsetPx: value,
                offsetPercent,
                direction,
                event: ev,
            },
            deltaPx: ev.clientX - this.previousClientX,
        };
        this._resize$.next(nextEvent);
        this.resize$.next(this._widthMap);
        this.previousClientX = ev.clientX;
    }

    protected abstract _stateFilter: (state: IResizeEvent<T>) => boolean;
    protected abstract _resizeLeftFilter: (state: IResizeEvent<T>) => boolean;
    protected abstract _resizeRightFilter: (state: IResizeEvent<T>) => boolean;
    protected abstract _stateUpdate: (state: IResizeEvent<T>) => void;

    protected _neighbourIndexOffset = 0;

    protected _headers?: HTMLDivElement[];
    protected _table?: HTMLTableElement | null;
    protected _definitions?: UiGridColumnDirective<T>[];
    protected _gridElement: HTMLDivElement;
    protected _gridResizeObserver?: ResizeObserver;
    protected _widthMap = new Map<string, number>();

    private _previous?: IResizeState<T> = {} as IResizeState<T>;
    private _direction?: ResizeDirection;
    private _resize$ = new Subject<IResizeEvent<T>>();
    private _stopped$ = new Subject<void>();
    private _widthChange$: Subject<number> = new Subject();

    // eslint-disable-next-line @typescript-eslint/member-ordering
    widthChange$ = this._widthChange$.pipe(
        debounceTime(50),
    );

    constructor(
        protected _grid: ResizableGrid<T>,
    ) {
        // eslint-disable-next-line no-underscore-dangle
        this._gridElement = (_grid as any)._ref.nativeElement;

        merge(
            _grid.rendered,
            // eslint-disable-next-line no-underscore-dangle
            (_grid as any)._columnChanges$,
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
            // eslint-disable-next-line no-underscore-dangle
            takeUntil((_grid as any)._destroyed$),
        ).subscribe();

        this._gridResizeObserver = new ResizeObserver(entries => {
            if (entries.length) {
                this._widthChange$.next(entries[0].contentRect.width);
            }
        });

        this._gridResizeObserver.observe(this._gridElement);
    }

    handleResize = (ev: MouseEvent) => this._resizeEvent = ev;

    startResize(ev: MouseEvent, column: UiGridColumnDirective<T>, columnIndex: number) {
        this.resizeStart$.next({
            mouseEvent: ev,
            columnIndex,
        });
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
        // eslint-disable-next-line no-underscore-dangle
        (this._grid as any)._cd.detectChanges();
        // eslint-disable-next-line no-underscore-dangle
        (this._grid as any)._cd.detach();
    }

    startKeyboardResize(direction: 'left' | 'right', column: UiGridColumnDirective<T>, columnIndex: number) {
        if (this.isResizing) { return; }
        this.resizeStart$.next({
            columnIndex,
            direction,
        });
        const columnElement = document.querySelector(`[data-property="${column.property as string}"]`);
        const { x, width } = columnElement!.getBoundingClientRect()!;
        let currentX = x + width;
        const maxSpeed = 50;
        const directionFactor = direction === 'left' ? -1 : 1;
        const eventFrequency = 16;
        const step = 0.5;
        let speed = 1;

        this.isResizing = true;
        // hook events
        this.setupState({ clientX: currentX } as any, column);

        const defaultView = this._gridElement.ownerDocument!.defaultView!;

        const keyUp$ = fromEvent(defaultView, 'keyup')
            .pipe(
                take(1),
                takeUntil(this._stopped$),
            );

        keyUp$.subscribe(() => this.stop());

        interval(eventFrequency)
            .pipe(
                takeUntil(this._stopped$),
            )
            .subscribe(() => {
                speed = Math.min(speed + step, maxSpeed);
                currentX += speed * directionFactor;
                this.handleResize({ clientX: currentX } as MouseEvent);
            });

        // detection is required in order to update cell resize state
        // eslint-disable-next-line no-underscore-dangle
        (this._grid as any)._cd.detectChanges();
        // eslint-disable-next-line no-underscore-dangle
        (this._grid as any)._cd.detach();
    }

    stop() {
        this._stopped$.next();
        const current = this.current;
        this.endResize();
        this.isResizing = false;
        // it's added after the `endResize` call to ensure new width values upon emission
        this.resizeEnd$.next(current);

        // detection is required in order to update cell resize state
        // eslint-disable-next-line no-underscore-dangle
        (this._grid as any)._cd.reattach();
        // eslint-disable-next-line no-underscore-dangle
        (this._grid as any)._cd.markForCheck();
    }

    setupState(ev: MouseEvent, column: UiGridColumnDirective<T>) {
        this.current = {} as IResizeInfo<T>;
        this.current.index = findHeaderIndexFor(this._headers!, column.identifier);
        this.current = Object.assign(this.current, {
            column,
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
                takeUntil(this._stopped$),
            )
            .subscribe(this._stateUpdate);
    }

    endResize() {
        const entries = [this.current!, this._previous!.neighbour, this._previous!.oppositeNeighbour];
        this._emitNewColumnPercentages(entries.filter(e => e != null) as IResizeInfo<T>[]);
        this._endResizeCommon(...entries);

        this.current = undefined;
        this._direction = NaN;
    }

    destroy() {
        this._gridResizeObserver?.disconnect();
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

    protected _simulateStopFor(ev: MouseEvent | undefined, ...neighbours: (IResizeInfo<T> | undefined)[]) {
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

    protected _computePixelsToPercentRatio() {
        if (!this._definitions?.length) {
            return 0;
        }
        const totalColumnWidths = this._definitions.reduce((acc, curr) => acc + Number(curr.width), 0);
        const totalHeaderWidths = this._headers!.reduce((acc, curr) => acc + curr.getBoundingClientRect().width, 0) || 1;

        return totalColumnWidths / totalHeaderWidths;
    }

    protected _endResizeCommon(..._entries: (IResizeInfo<T> | undefined)[]) {
        this.previousClientX = 0;

        this._previous = {} as IResizeState<T>;
    }

    protected _emitNewColumnPercentages(entries: IResizeInfo<T>[]) {
        const resizeEmissions = entries.reduce((acc, curr) => {
            acc[curr.column.property!.toString()] = {
                initialPercentage: +curr.column.width / 10,
                finalPercentage: +this._widthMap.get(curr.column.identifier)! / 10,
            };
            return acc;
        }, {} as ResizeEmission);
        this.resizeEmissions$.next(resizeEmissions);
    }

    private _getCellsFor = (property: string) => toArray<HTMLDivElement>(
        this._gridElement
            .querySelectorAll(cellSelector(property)),
    );

    private _startResizeCommon(ev?: MouseEvent) {
        if (!ev) { return; }
        if (!this._previous) { return; }

        this._previous = Object.assign(this._previous, {
            offsetPx: 0,
        });
        this.current!.dragInitX = ev.clientX;
    }

}

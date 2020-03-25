import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ContentChildren,
    ElementRef,
    EventEmitter,
    HostBinding,
    HostListener,
    Input,
    NgZone,
    OnChanges,
    OnDestroy,
    Optional,
    Output,
    QueryList,
    SimpleChanges,
    ViewEncapsulation,
} from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { QueuedAnnouncer } from '@uipath/angular/a11y';

import range from 'lodash-es/range';
import {
    animationFrameScheduler,
    BehaviorSubject,
    merge,
    Observable,
    Subject,
} from 'rxjs';
import {
    debounceTime,
    distinctUntilChanged,
    map,
    observeOn,
    skip,
    switchMap,
    take,
    takeUntil,
    tap,
} from 'rxjs/operators';

import { UiGridColumnDirective } from './body/ui-grid-column.directive';
import { UiGridExpandedRowDirective } from './body/ui-grid-expanded-row.directive';
import { UiGridRowActionDirective } from './body/ui-grid-row-action.directive';
import { UiGridRowConfigDirective } from './body/ui-grid-row-config.directive';
import { UiGridFooterDirective } from './footer/ui-grid-footer.directive';
import { UiGridHeaderDirective } from './header/ui-grid-header.directive';
import {
    DataManager,
    FilterManager,
    LiveAnnouncerManager,
    PerformanceMonitor,
    ResizeManager,
    ResizeManagerFactory,
    ResizeStrategy,
    SelectionManager,
    SortManager,
    VisibilityManger,
} from './managers';
import { ResizableGrid } from './managers/resize/types';
import {
    IGridDataEntry,
    ISortModel,
} from './models';
import { UiGridIntl } from './ui-grid.intl';

@Component({
    selector: 'ui-grid',
    templateUrl: './ui-grid.component.html',
    styleUrls: [
        './ui-grid.component.scss',
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class UiGridComponent<T extends IGridDataEntry> extends ResizableGrid<T> implements AfterContentInit, OnChanges, OnDestroy {
    /**
     * The data list that needs to be rendered within the grid.
     *
     * NOTE: to have access to all functionality, we recommend that entities display in the grid implement the IGridDataEntry interface.
     *
     * @param value The list that needs to rendered.
     */
    @Input()
    public set data(value: T[]) {
        this._performanceMonitor.reset();
        this.dataManager.update(value);
    }

    /**
     * Marks the grid resizing state.
     *
     */
    @HostBinding('class.ui-grid-state-resizing')
    @Input()
    public get isResizing() {
        return this.resizeManager.isResizing;
    }

    /**
     * Marks the grid projected state.
     *
     */
    @HostBinding('class.ui-grid-state-projected')
    @Input()
    public isProjected: boolean;

    /**
     * Determines if all of the items are currently checked.
     *
     */
    public get isEveryVisibleRowChecked() {
        return this.dataManager.length &&
            this.dataManager.every(row => this.selectionManager.isSelected(row!));
    }

    /**
     * Determines if there's a value selected within the currently rendered items (used for multi-page selection).
     *
     */
    public get hasValueOnVisiblePage() {
        return this.dataManager.some(row => this.selectionManager.isSelected(row!));
    }

    /**
     * The desired resize strategy.
     *
     * FIXME: Currently only `ImmediateNeighbourHalt` is stable.
     *
     */
    @Input()
    public set resizeStrategy(value: ResizeStrategy) {
        if (value === this._resizeStrategy) { return; }

        this._resizeStrategy = value;

        if (this.resizeManager != null) {
            this.resizeManager.destroy();
        }

        this.resizeManager = ResizeManagerFactory(this._resizeStrategy, this);
    }

    /**
     * Marks the grid loading state.
     *
     */
    @HostBinding('class.ui-grid-state-loading')
    @Input()
    public loading = false;

    /**
     * Marks the grid enabled state.
     *
     */
    @HostBinding('class.ui-grid-state-disabled')
    @Input()
    public disabled = false;

    /**
     * Configure if the grid allows item selection.
     *
     */
    @Input()
    public selectable = true;

    /**
     * Configure if the grid allows to toggle column visibility.
     *
     */
    @Input()
    public toggleColumns = false;

    /**
     * Configure if the grid allows multi-page selection.
     *
     */
    @HostBinding('class.ui-grid-mode-multi-select')
    @Input()
    public multiPageSelect = false;

    /**
     * Configure if the grid is refreshable.
     *
     */
    @Input()
    public refreshable = true;

    /**
     * Configure if `virtualScroll` is enabled.
     *
     */
    @Input()
    public virtualScroll = false;

    /**
     * Show paint time stats
     *
     */
    @Input()
    public showPaintTime = false;

    /**
     * Provide a custom `noDataMessage`.
     *
     */
    @Input()
    public noDataMessage?: string;

    /**
     * Set the expanded entry.
     *
     */
    @Input()
    public expandedEntry?: T;

    /**
     * Configure if the expanded entry should replace the active row, or add a new row with the expanded view.
     *
     */
    @Input()
    public expandMode: 'preserve' | 'collapse' = 'collapse';

    /**
     * Configure if ui-grid-header-row should be visible, by default it is visible
     *
     */
    @Input()
    public showHeaderRow = true;

    /**
     * Emits an event with the sort model when a column sort changes.
     *
     */
    @Output()
    public sortChange = new EventEmitter<ISortModel<T>>();

    /**
     * Emits an event when user click the refresh button.
     *
     */
    @Output()
    public refresh = new EventEmitter<void>();

    /**
     * Emits an event once the grid has been rendered.
     *
     */
    @Output()
    public rendered = new EventEmitter<void>();

    /**
     * Emits the column definitions when their definition changes.
     *
     */
    public columns$ = new BehaviorSubject<UiGridColumnDirective<T>[]>([]);

    /**
     * Row configuration directive reference.
     *
     * @ignore
     */
    @ContentChild(UiGridRowConfigDirective, {
        static: true,
    })
    public rowConfig?: UiGridRowConfigDirective<T>;

    /**
     * Row action directive reference.
     *
     * @ignore
     */
    @ContentChild(UiGridRowActionDirective, {
        static: true,
    })
    public actions?: UiGridRowActionDirective;

    /**
     * Footer directive reference.
     *
     * @ignore
     */
    @ContentChild(UiGridFooterDirective, {
        static: true,
    })
    public footer?: UiGridFooterDirective;

    /**
     * Header directive reference.
     *
     * @ignore
     */
    @ContentChild(UiGridHeaderDirective, {
        static: true,
    })
    public header?: UiGridHeaderDirective<T>;

    /**
     * Column directive reference list.
     *
     * @ignore
     */
    @ContentChildren(UiGridColumnDirective)
    public columns!: QueryList<UiGridColumnDirective<T>>;

    /**
     * Expanded row template reference.
     *
     * @ignore
     */
    @ContentChild(UiGridExpandedRowDirective, {
        static: true,
    })
    public expandedRow?: UiGridExpandedRowDirective;

    /**
     * Live announcer manager, used to emit notification via `aria-live`.
     *
     */
    public liveAnnouncerManager?: LiveAnnouncerManager<T>;

    /**
     * Selection manager, used to manage grid selection states.
     *
     */
    public selectionManager = new SelectionManager<T>();

    /**
     * Data manager, used to optimize row rendering.
     *
     */
    public dataManager = new DataManager<T>();

    /**
     * Filter manager, used to manage filter state changes.
     *
     */
    public filterManager = new FilterManager<T>();

    /**
     * Visibility manager, used to manage visibility of columns.
     *
     */
    public visibilityManager = new VisibilityManger<T>();

    /**
     * Sort manager, used to manage sort state changes.
     *
     */
    public sortManager = new SortManager<T>();

    /**
     * Resize manager, used to compute resized column states.
     *
     */
    public resizeManager: ResizeManager<T>;

    /**
     * @ignore
     */
    public paintTime$: Observable<string>;

    /**
     * Emits with information wether filters are defined.
     *
     */
    public isAnyFilterDefined$ = new BehaviorSubject<boolean>(false);

    /**
     * Emits the visible column definitions when their definition changes.
     *
     */
    public visible$ = this.visibilityManager.columns$;

    /**
     * Returns the scroll size, in order to compensate for the scrollbar.
     *
     * @deprecated
     */
    public scrollCompensationWidth = 0;

    /**
     * @internal
     * @ignore
     */
    public scrollCompensationWidth$ = this.dataManager.data$.pipe(
        map(data => data.length),
        distinctUntilChanged(),
        observeOn(animationFrameScheduler),
        debounceTime(0),
        map(() => this._ref.nativeElement.querySelector('.ui-grid-viewport')),
        map(view => view ? view.offsetWidth - view.clientWidth : 0),
        // tslint:disable-next-line: deprecation
        tap(compensationWidth => this.scrollCompensationWidth = compensationWidth),
    );

    /**
     * Determines if the multi-page selection row should be displayed.
     *
     */
    public get showMultiPageSelectionInfo() {
        return this.multiPageSelect &&
            !this.dataManager.pristine &&
            (
                this.dataManager.length ||
                this.selectionManager.selected.length
            );
    }

    protected _destroyed$ = new Subject<void>();
    protected _columnChanges$: Observable<SimpleChanges>;

    private _resizeStrategy = ResizeStrategy.ImmediateNeighbourHalt;
    private _performanceMonitor: PerformanceMonitor;
    private _configure$ = new Subject();
    private _isShiftPressed = false;
    private _lastCheckboxIdx = 0;

    /**
     * @ignore
     */
    constructor(
        @Optional()
        public intl: UiGridIntl,
        protected _ref: ElementRef,
        protected _cd: ChangeDetectorRef,
        private _zone: NgZone,
        private _queuedAnnouncer: QueuedAnnouncer,
    ) {
        super();

        this.isProjected = this._ref.nativeElement.classList.contains('ui-grid-state-responsive');

        this.intl = intl || new UiGridIntl();

        this._columnChanges$ =
            this.rendered.pipe(
                switchMap(() => merge(
                    ...this.columns.map(column =>
                        column.change$,
                    )),
                ),
                debounceTime(10),
                tap(() => this.isResizing && this.resizeManager.stop()),
            );

        const sort$ = this.sortManager
            .sort$
            .pipe(
                tap(ev => this.sortChange.emit(ev)),
            );

        const inputChanges$ = merge(
            this.intl.changes,
            this._configure$,
            this._columnChanges$,
        ).pipe(
            map(() => this.columns.toArray()),
            tap(columns => this.filterManager.columns = columns),
            tap(columns => this.sortManager.columns = columns),
            tap(columns => this.visibilityManager.columns = columns),
            tap(columns => this.columns$.next(columns)),
            tap(columns => this.isAnyFilterDefined$.next(
                columns.some(c => !!c.dropdown || !!c.searchableDropdown),
            )),
        );

        const data$ = this.dataManager.data$.pipe(
            tap(_ => this._lastCheckboxIdx = 0),
        );

        const selection$ = this.selectionManager.changed$.pipe(
            tap(_ => this._cd.markForCheck()),
        );

        merge(
            sort$,
            inputChanges$,
            data$,
            selection$,
        ).pipe(
            takeUntil(this._destroyed$),
        ).subscribe();

        this.resizeManager = ResizeManagerFactory(this._resizeStrategy, this);
        this._performanceMonitor = new PerformanceMonitor(_ref.nativeElement);
        this.paintTime$ = this._performanceMonitor.paintTime$;
    }

    /**
     * @ignore
     */
    ngAfterContentInit() {
        this.liveAnnouncerManager = new LiveAnnouncerManager(
            msg => this._queuedAnnouncer.enqueue(msg),
            this.intl,
            this.dataManager.data$,
            this.sortManager.sort$.pipe(skip(1)),
            this.refresh,
            this.footer && this.footer.pageChange,
        );

        this._configure$.next();

        this._zone.onStable.pipe(
            take(1),
        ).subscribe(() => {
            // ensure everything is painted once initial rendering is done
            // a lot of templates loaded lazily, this is required
            // to ensure everything is drawn once the grid is initalized
            this._cd.markForCheck();

            this.rendered.next();
        });

        this.columns.changes
            .pipe(
                takeUntil(this._destroyed$),
            ).subscribe(
                () => this._configure$.next(),
            );
    }

    /**
     * @ignore
     */
    ngOnChanges(changes: SimpleChanges) {
        const selectableChange = changes['selectable'];
        if (
            selectableChange &&
            !selectableChange.firstChange &&
            selectableChange.previousValue !== selectableChange.currentValue
        ) {
            this.selectionManager.clear();
            this._configure$.next();
        }

        const dataChange = changes['data'];

        if (
            dataChange &&
            !dataChange.firstChange &&
            !this.multiPageSelect
        ) {
            this._performanceMonitor.reset();
            this.selectionManager.clear();
        }
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.sortChange.complete();
        this.rendered.complete();
        this.columns$.complete();
        this.isAnyFilterDefined$.complete();

        this.dataManager.destroy();
        this.resizeManager.destroy();
        this.sortManager.destroy();
        this.selectionManager.destroy();
        this.filterManager.destroy();
        this.visibilityManager.destroy();

        if (this.liveAnnouncerManager) {
            this.liveAnnouncerManager.destroy();
        }

        this._performanceMonitor.destroy();

        this._destroyed$.next();
        this._destroyed$.complete();
        this._configure$.complete();
    }

    /**
     * Marks if the `Shift` key is pressed.
     */
    @HostListener('document:keydown.shift', ['$event'])
    @HostListener('document:keyup.shift', ['$event'])
    public toggleShift(ev: MouseEvent) {
        this._isShiftPressed = ev.shiftKey;
    }

    /**
     * Handles row selection, and reacts if the `Shift` key is pressed.
     *
     * @param idx The clicked row index.
     * @param entry The entry associated to the selected row.
     */
    public handleSelection(idx: number, entry: T) {
        if (!this._isShiftPressed) {
            this._lastCheckboxIdx = idx;
            this.selectionManager.toggle(entry);
            return;
        }

        const min = Math.min(this._lastCheckboxIdx, idx);
        const max = Math.max(idx, this._lastCheckboxIdx);

        this.selectionManager.deselect(...this.dataManager.data$.getValue());
        /**
         * If min = max, the checkbox will be deselected as a consequence of clicking
         * and will remain rendered as unchecked, even though we selected it
         * to prevent this invalid render state, we check for changes after deselecting the rows
         */

        const rows = range(min, max + 1)
            .map(this.dataManager.get);
        this.selectionManager.select(...rows);
        this._cd.detectChanges();
    }

    /**
     * Toggles the row selection state.
     *
     */
    public toggle(ev: MatCheckboxChange) {
        if (ev.checked) {
            this.dataManager.forEach(row => this.selectionManager.select(row!));
        } else {
            this._lastCheckboxIdx = 0;
            this.dataManager.forEach(row => this.selectionManager.deselect(row!));
        }
    }

    /**
     * Determines the `checkbox` `aria-label`.
     *
     * @param [row] The row for which the label is computed.
     */
    public checkboxLabel(row?: T): string {
        if (!row) {
            return `${this.isEveryVisibleRowChecked ? 'select' : 'deselect'} all`;
        }
        return `${this.selectionManager.isSelected(row) ? 'deselect' : 'select'} row ${this.dataManager.indexOf(row)}`;
    }
}

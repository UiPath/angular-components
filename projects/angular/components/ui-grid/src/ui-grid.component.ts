import range from 'lodash-es/range';
import {
    animationFrameScheduler,
    BehaviorSubject,
    combineLatest,
    merge,
    Observable,
    of,
    Subject,
    Subscription,
} from 'rxjs';
import {
    debounceTime,
    distinctUntilChanged,
    filter,
    map,
    observeOn,
    share,
    shareReplay,
    startWith,
    switchMap,
    take,
    takeUntil,
    tap,
} from 'rxjs/operators';

import {
    animate,
    style,
    transition,
    trigger,
} from '@angular/animations';
import { FocusOrigin } from '@angular/cdk/a11y';
import {
    AfterContentInit,
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ContentChildren,
    ElementRef,
    EventEmitter,
    HostBinding,
    HostListener,
    Inject,
    InjectionToken,
    Input,
    NgZone,
    OnChanges,
    OnDestroy,
    Optional,
    Output,
    QueryList,
    SimpleChanges,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import {
    MatCheckbox,
    MatCheckboxChange,
} from '@angular/material/checkbox';
import { MatTooltip } from '@angular/material/tooltip';
import { QueuedAnnouncer } from '@uipath/angular/a11y';
import { ISuggestValue } from '@uipath/angular/components/ui-suggest';

import { UiGridColumnDirective } from './body/ui-grid-column.directive';
import { UiGridExpandedRowDirective } from './body/ui-grid-expanded-row.directive';
import { UiGridLoadingDirective } from './body/ui-grid-loading.directive';
import { UiGridNoContentDirective } from './body/ui-grid-no-content.directive';
import { UiGridRowActionDirective } from './body/ui-grid-row-action.directive';
import { UiGridRowCardViewDirective } from './body/ui-grid-row-card-view.directive';
import { UiGridRowConfigDirective } from './body/ui-grid-row-config.directive';
import { UiGridSearchFilterDirective } from './filters/ui-grid-search-filter.directive';
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
import {
    IResizeEvent,
    ResizableGrid,
} from './managers/resize/types';
import {
    GridOptions,
    IFilterModel,
    IGridDataEntry,
    ISortModel,
} from './models';
import { UiGridIntl } from './ui-grid.intl';

export const UI_GRID_OPTIONS = new InjectionToken<GridOptions<unknown>>('UiGrid DataManager options.');
const DEFAULT_VIRTUAL_SCROLL_ITEM_SIZE = 48;
const FOCUSABLE_ELEMENTS_QUERY = 'a, button:not([hidden]), input:not([hidden]), textarea, select, details, [tabindex]:not([tabindex="-1"])';
const EXCLUDED_ROW_SELECTION_ELEMENTS = ['a', 'button', 'input', 'textarea', 'select'];

@Component({
    selector: 'ui-grid',
    templateUrl: './ui-grid.component.html',
    styleUrls: [
        './ui-grid.component.scss',
    ],
    animations: [
        trigger('filters-container', [
            transition(':enter', [
                style({
                    minHeight: '0',
                    height: '0',
                    opacity: '0',
                }),
                animate('0.15s ease-in', style({
                    opacity: '*',
                    minHeight: '*',
                    height: '*',
                    display: '*',
                })),
            ]),
            transition(':leave', [
                style({
                    minHeight: '*',
                    height: '*',
                }),
                animate('0.15s ease-in', style({
                    opacity: '0',
                    minHeight: '0',
                    height: '0',
                })),
            ]),
        ]),
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class UiGridComponent<T extends IGridDataEntry>
    extends ResizableGrid<T>
    implements AfterContentInit, AfterViewInit, OnChanges, OnDestroy {
    /**
     * The data list that needs to be rendered within the grid.
     *
     * NOTE: to have access to all functionality, we recommend that entities display in the grid implement the IGridDataEntry interface.
     *
     * @param value The list that needs to rendered.
     */
    @Input()
    set data(value: T[] | null) {
        this._performanceMonitor.reset();
        this.dataManager.update(value);
    }

    /**
     * Marks the grid resizing state.
     *
     */
    @HostBinding('class.ui-grid-state-resizing')
    @Input()
    get isResizing() {
        return this.resizeManager.isResizing;
    }

    /**
     * Marks the grid projected state.
     *
     */
    @HostBinding('class.ui-grid-state-projected')
    @Input()
    isProjected: boolean;

    /**
     * Determines if all of the items are currently checked.
     *
     */
    get isEveryVisibleRowChecked() {
        return !!this.dataManager.length &&
            this.dataManager.every(row => this.selectionManager.isSelected(row!));
    }

    /**
     * Determines if there's a value selected within the currently rendered items (used for multi-page selection).
     *
     */
    get hasValueOnVisiblePage() {
        return this.dataManager.some(row => this.selectionManager.isSelected(row!));
    }

    /**
     * The desired resize strategy.
     *
     * FIXME: Currently only `ImmediateNeighbourHalt` is stable.
     *
     */
    @Input()
    set resizeStrategy(value: ResizeStrategy) {
        if (value === this._resizeStrategy) { return; }

        this._resizeStrategy = value;

        if (this.resizeManager != null) {
            this.resizeManager.destroy();
        }

        this._initResizeManager();
    }

    /**
     * Marks the grid loading state.
     *
     */
    @HostBinding('class.ui-grid-state-loading')
    @Input()
    loading = false;

    /**
     * Marks the grid enabled state.
     *
     */
    @HostBinding('class.ui-grid-state-disabled')
    @Input()
    disabled = false;

    /**
     * Configure if the grid search filters are eager or on open.
     *
     */
    @Input()
    set collapseFiltersCount(count: number) {
        if (count === this._collapseFiltersCount$.value) { return; }
        this._collapseFiltersCount$.next(count);
    }
    get collapseFiltersCount() {
        return this._collapseFiltersCount$.value;
    }

    /**
     * Configure if the grid search filters are eager or on open.
     *
     */
    @Input()
    set fetchStrategy(fetchStrategy: 'eager' | 'onOpen') {
        if (fetchStrategy === this.fetchStrategy) { return; }
        this._fetchStrategy = fetchStrategy;
    }
    get fetchStrategy() {
        return this._fetchStrategy;
    }

    /**
     * Configure if the grid allows item selection.
     *
     */
    @Input()
    selectable = true;

    /**
     * Configure if the grid allows radio button selection for its items.
     *
     */
    @Input()
    singleSelectable = false;

    /**
     * Configure if the grid selects entity on row click.
     *
     */
    @Input()
    shouldSelectOnRowClick = false;

    /**
     * Option to have collapsible filters.
     *
     * @deprecated - use `[collapseFiltersCount]="0" to render collapsed or leave out to always render inline`
     */
    @Input()
    set collapsibleFilters(collapse: boolean) {
        this._collapseFiltersCount$.next(collapse ? 0 : Number.POSITIVE_INFINITY);
    }
    get collapsibleFilters() {
        return !this._collapseFiltersCount$.value;
    }

    /**
     * Configure if the grid allows to toggle column visibility.
     *
     */
    @Input()
    toggleColumns = false;

    /**
     * Configure if the grid allows multi-page selection.
     *
     */
    @HostBinding('class.ui-grid-mode-multi-select')
    @Input()
    multiPageSelect = false;

    /**
     * Configure if the grid is refreshable.
     *
     */
    @Input()
    refreshable = true;

    /**
     * Configure if `virtualScroll` is enabled.
     *
     */
    @Input()
    virtualScroll = false;

    /**
     * Configure the row item size for virtualScroll
     *
     */
    @Input()
    rowSize: number;

    /**
     * Show paint time stats
     *
     */
    @Input()
    showPaintTime = false;

    /**
     * Provide a custom `noDataMessage`.
     *
     */
    @Input()
    noDataMessage?: string;

    /**
     * Set the expanded entry.
     *
     * @deprecated Use `expandedEntries` instead.
     */
    @Input()
    set expandedEntry(entry: T | undefined) {
        this.expandedEntries = entry;
    }
    get expandedEntry() {
        return this._expandedEntries[0];
    }

    /**
     * Set the expanded entry / entries.
     *
     */
    @Input()
    set expandedEntries(entry: T | T[] | undefined) {
        if (!entry) {
            this._expandedEntries = [];
            return;
        }
        this._expandedEntries = Array.isArray(entry) ? entry : [entry];
    }
    get expandedEntries() {
        return this._expandedEntries;
    }

    /**
     * Configure if the expanded entry should replace the active row, or add a new row with the expanded view.
     *
     */
    @Input()
    expandMode: 'preserve' | 'collapse' = 'collapse';

    /**
     * Configure if ui-grid-header-row should be visible, by default it is visible
     *
     */
    @Input()
    showHeaderRow = true;

    /**
     * Configure a function that receives the whole grid row, and returns
     * disabled message if the row should not be selectable
     *
     */
    @Input()
    disableSelectionByEntry: (entry: T) => null | string;

    @Input()
    set customFilterValue(customValue: IFilterModel<T>[]) {
        if (!Array.isArray(customValue) || !customValue.length) { return; }
        this.filterManager.updateCustomFilters(customValue);
    }

    /**
     * Configure if Card view should be used
     *
     */
    @Input()
    useCardView = false;

    @Input()
    freezeColumns = 0;

    @Input()
    width = '';

    /**
     * Emits an event with the sort model when a column sort changes.
     *
     */
    @Output()
    sortChange = new EventEmitter<ISortModel<T>>();

    /**
     * Emits an event when user click the refresh button.
     *
     */
    @Output()
    refresh = new EventEmitter<void>();

    /**
     * Emits an event once the grid has been rendered.
     *
     */
    @Output()
    rendered = new EventEmitter<void>();

    /**
     * Emits an event once the grid has been rendered.
     *
     */
    @Output()
    resizeEnd = new EventEmitter<void>();

    @Output()
    removeCustomFilter = new EventEmitter<void>();

    /**
     * Emits an event when a row is clicked.
     *
     */
    @Output()
    rowClick = new EventEmitter<{ event: Event; row: T }>();

    /**
     * Emits the column definitions when their definition changes.
     *
     */
    columns$ = new BehaviorSubject<UiGridColumnDirective<T>[]>([]);

    /**
     * Row configuration directive reference.
     *
     * @ignore
     */
    @ContentChild(UiGridRowConfigDirective, {
        static: true,
    })
    rowConfig?: UiGridRowConfigDirective<T>;

    /**
     * Row action directive reference.
     *
     * @ignore
     */
    @ContentChild(UiGridRowActionDirective, {
        static: true,
    })
    actions?: UiGridRowActionDirective;

    /**
     * Footer directive reference.
     *
     * @ignore
     */
    @ContentChild(UiGridFooterDirective, {
        static: true,
    })
    footer?: UiGridFooterDirective;

    /**
     * Header directive reference.
     *
     * @ignore
     */
    @ContentChild(UiGridHeaderDirective, {
        static: true,
    })
    header?: UiGridHeaderDirective<T>;

    /**
     * Column directive reference list.
     *
     * @ignore
     */
    @ContentChildren(UiGridColumnDirective)
    columns!: QueryList<UiGridColumnDirective<T>>;

    /**
     * Expanded row template reference.
     *
     * @ignore
     */
    @ContentChild(UiGridExpandedRowDirective, {
        static: true,
    })
    expandedRow?: UiGridExpandedRowDirective;

    /**
     * No content custom template reference.
     *
     * @ignore
     */
    @ContentChild(UiGridNoContentDirective, {
        static: true,
    })
    noContent?: UiGridNoContentDirective;

    /**
     * Custom loading template reference.
     *
     * @ignore
     */
    @ContentChild(UiGridLoadingDirective, {
        static: true,
    })
    loadingState?: UiGridLoadingDirective;

    /**
     * Custom card view template reference.
     *
     * @ignore
     */
    @ContentChild(UiGridRowCardViewDirective, {
        static: true,
    })
    cardTemplate?: UiGridRowCardViewDirective<T>;
    /**
     * Reference to the grid action buttons container
     *
     * @ignore
     */
    @ViewChild('gridActionButtons')
    gridActionButtons!: ElementRef;

    /**
     * Reference to select all available rows checkbox
     *
     * @ignore
     */
    @ViewChild('selectAvailableRowsCheckbox')
    selectAvailableRowsCheckbox?: MatCheckbox;

    /**
     * Toggle filters row display state
     *
     */
    showFilters = false;

    /**
     * Live announcer manager, used to emit notification via `aria-live`.
     *
     */
    liveAnnouncerManager?: LiveAnnouncerManager<T>;

    /**
     * Selection manager, used to manage grid selection states.
     *
     */
    selectionManager = new SelectionManager<T>();

    /**
     * Data manager, used to optimize row rendering.
     *
     */
    dataManager = new DataManager<T>(this._gridOptions);

    /**
     * Filter manager, used to manage filter state changes.
     *
     */
    filterManager = new FilterManager<T>();

    /**
     * Visibility manager, used to manage visibility of columns.
     *
     */
    visibilityManager = new VisibilityManger<T>();

    /**
     * Sort manager, used to manage sort state changes.
     *
     */
    sortManager = new SortManager<T>();

    /**
     * Resize manager, used to compute resized column states.
     *
     */
    resizeManager!: ResizeManager<T>;

    /**
     * @ignore
     */
    paintTime$: Observable<string>;

    /**
     * Emits with information whether filters are defined.
     *
     */
    isAnyFilterDefined$ = new BehaviorSubject<boolean>(false);

    /**
     * Emits with information whether any filter is visible.
     *
     */
    hasAnyFiltersVisible$: Observable<boolean>;

    /**
     * Emits with information whether the dvider for toggle columns should be displayed
     *
     */
    displayToggleColumnsDivider$?: Observable<boolean>;

    /**
     * Emits the visible column definitions when their definition changes.
     *
     */
    visible$ = this.visibilityManager.columns$;

    /**
     * Emits when the visible columns menu has been opened or closed
     *
     */
    visibleColumnsToggle$ = new BehaviorSubject<boolean>(false);

    /**
     * Returns the scroll size, in order to compensate for the scrollbar.
     *
     * @deprecated
     */
    scrollCompensationWidth = 0;

    /**
     * Whether column header is focused.
     *
     */
    focusedColumnHeader = false;

    /**
     * @internal
     * @ignore
     */
    scrollCompensationWidth$ = this.dataManager.data$.pipe(
        map(data => data.length),
        distinctUntilChanged(),
        observeOn(animationFrameScheduler),
        debounceTime(0),
        map(() => this._ref.nativeElement.querySelector('.ui-grid-viewport')),
        map(view => view ? view.offsetWidth - view.clientWidth : 0),
        // eslint-disable-next-line import/no-deprecated
        tap(compensationWidth => this.scrollCompensationWidth = compensationWidth),
    );

    hasSelection$ = this.selectionManager.hasValue$.pipe(
        tap(hasSelection => {
            if (hasSelection && !!this.header?.actionButtons?.length) {
                this._announceGridHeaderActions();
            }
        }),
        share(),
    );

    renderedColumns$ = this.visible$.pipe(
        map(columns => {
            const firstIndex = columns.findIndex(c => c.primary);
            const rowHeaderIndex = firstIndex > -1 ? firstIndex : 0;

            return columns.map((directive, index) => ({
                directive,
                role: index === rowHeaderIndex ? 'rowheader' : 'gridcell',
            }));
        }),
    );

    areFilersCollapsed$: Observable<boolean>;

    /**
     * Determines if the multi-page selection row should be displayed.
     *
     */
    get showMultiPageSelectionInfo() {
        return this.multiPageSelect &&
            !this.dataManager.pristine &&
            (
                this.dataManager.length ||
                this.selectionManager.selected.length
            );
    }

    protected _destroyed$ = new Subject<void>();
    protected _columnChanges$: Observable<SimpleChanges>;

    private _fetchStrategy!: 'eager' | 'onOpen';
    private _collapseFiltersCount$!: BehaviorSubject<number>;
    private _resizeStrategy = ResizeStrategy.ImmediateNeighbourHalt;
    private _performanceMonitor: PerformanceMonitor;
    private _configure$ = new Subject<void>();
    private _isShiftPressed = false;
    private _lastCheckboxIdx = 0;
    private _resizeSubscription$: null | Subscription = null;
    private _expandedEntries: T[] = [];
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
        @Inject(UI_GRID_OPTIONS)
        @Optional()
        private _gridOptions?: GridOptions<T>,
    ) {
        super();

        this.disableSelectionByEntry = () => null;
        this._fetchStrategy = _gridOptions?.fetchStrategy ?? 'onOpen';
        this.rowSize = _gridOptions?.rowSize ?? DEFAULT_VIRTUAL_SCROLL_ITEM_SIZE;
        this._collapseFiltersCount$ = new BehaviorSubject(
            _gridOptions?.collapseFiltersCount ?? (_gridOptions?.collapsibleFilters === true ? 0 : Number.POSITIVE_INFINITY),
        );

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

        const visibleFilterCount$ = this.rendered.pipe(
            switchMap(() => this.columns.changes),
            startWith('Initial emission'),
            switchMap(() =>
                combineLatest(this.columns.map((column: UiGridColumnDirective<T>) =>
                    column.dropdown?.visible$ ?? column.searchableDropdown?.visible$ ?? of(false),
                )),
            ),
            map(areVisible => areVisible.filter(visible => visible).length),
            distinctUntilChanged(),
            shareReplay(),
        );

        this.hasAnyFiltersVisible$ = visibleFilterCount$.pipe(
            map(Boolean),
            distinctUntilChanged(),
        );

        this.areFilersCollapsed$ = combineLatest([
            visibleFilterCount$,
            this._collapseFiltersCount$,
        ]).pipe(
            map(([visible, minCollapse]) => visible > minCollapse),
            distinctUntilChanged(),
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

        this._initResizeManager();
        this._performanceMonitor = new PerformanceMonitor(_ref.nativeElement);
        this.paintTime$ = this._performanceMonitor.paintTime$;

        this.selectionManager.hasValue$.pipe(
            filter(hasValue => !hasValue && this.selectAvailableRowsCheckbox?.checked === true),
            takeUntil(this._destroyed$),
        ).subscribe(() => this.selectAvailableRowsCheckbox!.checked = false);

        this._initDisplayToggleColumnsDivider();
    }

    /**
     * Clear search term, filters and sorting and emits true after.
     */
    @Input()
    reset: () => Observable<boolean> = () => {
        if (this.header) {
            this.header.searchValue = '';
        }
        this.filterManager.clear();
        this.sortManager.clear();
        return of(true);
    };

    /**
     * @ignore
     */
    ngAfterContentInit() {
        this.selectionManager.disableSelectionByEntry = this.disableSelectionByEntry;

        this.liveAnnouncerManager = new LiveAnnouncerManager(
            msg => this._queuedAnnouncer.enqueue(msg),
            this.intl,
            this.dataManager.data$,
            this.sortManager.sort$.pipe(
                filter(({ userEvent }) => !!userEvent),
            ),
            this.refresh,
            this.footer?.pageChange,
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

    // eslint-disable-next-line @typescript-eslint/member-ordering
    columnLeft: number[] = [];
    // eslint-disable-next-line @typescript-eslint/member-ordering
    gridResizeHandleLeft: number[] = [];
    // eslint-disable-next-line @typescript-eslint/member-ordering
    cellResizingBorderLeft: number[] = [];

    ngAfterViewInit(): void {
        this.initializeOffsetsLeft();
    }

    initializeOffsetsLeft() {
        const firstRow = this._ref.nativeElement.querySelector('.ui-grid-header-row') as HTMLDivElement;
        const firstRowCells = firstRow!.querySelectorAll('.ui-grid-header-cell');

        let totalWidth = 0;
        for (let i = 0; i < this.columns.length && i < this.freezeColumns; i++) {
            this.columnLeft[i] = totalWidth;
            totalWidth += firstRowCells[i].getBoundingClientRect().width;
            totalWidth += 3; // grid resize handle
            this.gridResizeHandleLeft[i] = totalWidth - 3;
            this.cellResizingBorderLeft[i] = totalWidth;

            if (i !== 0) {
                totalWidth += 3; // resizing border
            }
        }
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    previousColumnLeft: number[] = [];

    updateOffsetsLeft(resizeEvent: IResizeEvent<T>) {
        if (this.freezeColumns <= 1) {
            return;
        }

        const currentColumn = resizeEvent?.current.resized.column;
        // TBD: the first checkbox column is not in the column directives list, so we need to add 1 here
        const columnIndex = this._getIndexOfColumn(currentColumn) + 1;

        //       x
        // [][][]
        if (columnIndex >= this.freezeColumns) {
            return;
        }

        //    x
        // [][][]

        const firstRow = this._ref.nativeElement.querySelector('.ui-grid-header-row') as HTMLDivElement;
        const firstRowCells = firstRow!.querySelectorAll('.ui-grid-header-cell');

        let totalWidth = 0;

        for (let i = 0; i <= columnIndex + 1; i++) {
            if (i >= columnIndex) {
                // the columns left and right of the resizing border
                console.log(`Setting left ${totalWidth} for column ${i}`);
                this.columnLeft[i] = totalWidth;
                // TBD: this is not necessary for columnIndex == this.freezeColumns - 1
            }

            totalWidth += firstRowCells[i].getBoundingClientRect().width;

            if (i >= columnIndex) {
                this.gridResizeHandleLeft[i] = totalWidth - 3;
                this.cellResizingBorderLeft[i] = totalWidth;
            }

            if (i !== 0) {
                // the first column doesn't have a resizing border
                totalWidth += 3; // resizing border
            }
        }

        this._cd.detectChanges();
    }

    onResizeEnd() {
    }

    /**
     * @ignore
     */
    ngOnChanges(changes: SimpleChanges) {
        const selectableChange = changes.selectable;
        if (
            selectableChange &&
            !selectableChange.firstChange &&
            selectableChange.previousValue !== selectableChange.currentValue
        ) {
            this.selectionManager.clear();
            this._configure$.next();
        }

        const dataChange = changes.data;

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
    @HostListener('document:keydown', ['$event'])
    handleKeyDown(event: KeyboardEvent): void {
        this._isShiftPressed = event.shiftKey;
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyUp(event: KeyboardEvent): void {
        this._isShiftPressed = event.shiftKey;
    }

    /**
     * Handles row selection, and reacts if the `Shift` key is pressed.
     *
     * @param idx The clicked row index.
     * @param entry The entry associated to the selected row.
     */
    handleSelection(idx: number, entry: T) {
        if (!this._isShiftPressed) {
            this._lastCheckboxIdx = idx;
            this.selectionManager.toggle(entry);
            return;
        }

        const min = Math.min(this._lastCheckboxIdx, idx);
        const max = Math.max(idx, this._lastCheckboxIdx);

        const rowsForSelection = range(min, max + 1)
            .map(this.dataManager.get);
        const rowsForDeselection = this.dataManager.data$.getValue()
            .filter(row => !rowsForSelection.find(rowForSelection => rowForSelection.id === row.id));

        /**
         * To be consistent with the browser, if we click on a row
         * that was already selected, we unselect it, sync with DOM (detectChanges),
         * then we select it again (it's included in rowsForSelection).
         */
        if (this.selectionManager.isSelected(entry)) {
            this.selectionManager.deselect(entry);
            this._cd.detectChanges();
        }

        this.selectionManager.select(...rowsForSelection.filter(row => !this.selectionManager.isSelected(row)));
        this.selectionManager.deselect(...rowsForDeselection.filter(row => this.selectionManager.isSelected(row)));

        this._cd.detectChanges();
    }

    /**
     * Toggles the row selection state.
     *
     */
    toggle(ev: MatCheckboxChange) {
        if (ev.checked) {
            this.dataManager.forEach(row => this.selectionManager.select(row!));
        } else {
            this._lastCheckboxIdx = 0;
            this.dataManager.forEach(row => this.selectionManager.deselect(row!));
        }
    }

    /**
     * Determines the `checkbox` `matToolTip`.
     *
     * @param [row] The row for which the label is computed.
     */
    checkboxTooltip(row?: T): string {
        if (!row) {
            return this.intl.checkboxTooltip(this.isEveryVisibleRowChecked);
        }

        return this.intl.checkboxTooltip(this.selectionManager.isSelected(row), this.dataManager.indexOf(row));
    }

    /**
     * Determines the `checkbox` aria-label`.
     * **DEPRECATED**
     *
     * @param [row] The row for which the label is computed.
     */
    checkboxLabel(row?: T): string {
        if (!row) {
            return `${this.isEveryVisibleRowChecked ? 'select' : 'deselect'} all`;
        }
        return `${this.selectionManager.isSelected(row) ? 'deselect' : 'select'} row ${this.dataManager.indexOf(row)}`;
    }

    focusRowHeader() {
        this.gridActionButtons?.nativeElement.querySelector(FOCUSABLE_ELEMENTS_QUERY)?.focus();
    }

    clearCustomFilter() {
        this.removeCustomFilter.emit();
        this.filterManager.clearCustomFilters();
    }

    isRowExpanded(rowId?: IGridDataEntry['id']) {
        if (rowId == null) {
            return false;
        }

        return this._expandedEntries.some(el => el.id === rowId);
    }

    onRowClick(event: Event, row: T) {
        if (this.shouldSelectOnRowClick && (event.target instanceof Element) &&
            !EXCLUDED_ROW_SELECTION_ELEMENTS.find(el => (event.target as Element).closest(el))) {
            if (this.singleSelectable) {
                this.rowSelected(row);
            } else {
                this.selectionManager.toggle(row);
            }
        }
        this.rowClick.emit({
            event,
            row,
        });
    }

    checkIndeterminateState(indeterminateState: boolean) {
        // If the grid has disabled rows the indeterminate can be set to false and still not have all the rows selected,
        // in that case we set the indeterminate to true
        if (
            !indeterminateState &&
            this.selectAvailableRowsCheckbox &&
            this.hasValueOnVisiblePage &&
            !this.isEveryVisibleRowChecked
        ) {
            this.selectAvailableRowsCheckbox.indeterminate = true;
        }
    }

    searchableDropdownValue(searchableDropdown: UiGridSearchFilterDirective<T>): ISuggestValue[] {
        if (searchableDropdown.value) {
            if (searchableDropdown.multiple) {
                return searchableDropdown.value as ISuggestValue[];
            }
            return [searchableDropdown.value as ISuggestValue];
        }
        return [];
    }

    getColumnName(column: UiGridColumnDirective<T>, prefix = 'ui-grid-dropdown-filter') {
        return prefix + '-' + ((column.property as string) ?? 'na');
    }

    isFilterApplied(column: UiGridColumnDirective<T>) {
        return (column.dropdown?.value != null && column.dropdown!.value!.value !== column.dropdown!.emptyStateValue)
            || (column.searchableDropdown?.value != null && (column.searchableDropdown?.value as ISuggestValue[])?.length !== 0);
    }

    triggerColumnHeaderTooltip(event: FocusOrigin, tooltip: MatTooltip) {
        if (event === 'keyboard') {
            this.focusedColumnHeader = true;
            tooltip.show();
        }
    }

    hideColumnHeaderTooltip(tooltip: MatTooltip) {
        tooltip.hide();
        this.focusedColumnHeader = false;
    }

    focusActiveFilterItem() {
        const activeItem: HTMLElement | null = document.querySelector('.cdk-overlay-container .active[role="menuitem"]');
        activeItem?.focus();
    }

    rowSelected(row: T) {
        this.selectionManager.clear();
        this.selectionManager.select(row);
    }

    private _getIndexOfColumn(column: UiGridColumnDirective<T>): number {
        const index = this.columns.toArray().findIndex(c => c === column);
        return index;
    }

    private _announceGridHeaderActions() {
        this._queuedAnnouncer.enqueue(this.intl.gridHeaderActionsNotice);
    }

    private _initResizeManager() {
        this._resizeSubscription$?.unsubscribe();
        this.resizeManager = ResizeManagerFactory(this._resizeStrategy, this);

        // eslint-disable-next-line no-underscore-dangle
        this.resizeManager._resize$.subscribe((resizeEvent: IResizeEvent<T>) => {
            // KEK
            this.updateOffsetsLeft(resizeEvent);
        });

        this._resizeSubscription$ = this.resizeManager.resizeEnd$.subscribe((resizeInfo) => {
            if (resizeInfo) {
                const gridHeaderCellElement = resizeInfo.element;
                gridHeaderCellElement.focus();
            }

            this.onResizeEnd();

            this.resizeEnd.emit();
        });
    }

    private _initDisplayToggleColumnsDivider() {
        this.displayToggleColumnsDivider$ = combineLatest([this.hasAnyFiltersVisible$, this.filterManager.hasCustomFilter$]).pipe(
            map(([hasAnyFilterVisible, hasCustomFilters]) => hasAnyFilterVisible || hasCustomFilters),
        );
    }
}

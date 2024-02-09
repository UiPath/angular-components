import cloneDeep from 'lodash-es/cloneDeep';
import isEqual from 'lodash-es/isEqual';
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
    delay,
    distinctUntilChanged,
    filter,
    finalize,
    map,
    observeOn,
    retry,
    skip,
    startWith,
    switchMap,
    takeUntil,
    tap,
} from 'rxjs/operators';

import { LiveAnnouncer } from '@angular/cdk/a11y';
import { ListRange } from '@angular/cdk/collections';
import { ConnectedPosition } from '@angular/cdk/overlay';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ElementRef,
    EventEmitter,
    HostBinding,
    Input,
    isDevMode,
    NgZone,
    OnChanges,
    OnDestroy,
    OnInit,
    Optional,
    Output,
    Self,
    SimpleChanges,
    TemplateRef,
    TrackByFunction,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import {
    FormGroupDirective,
    NgControl,
    NgForm,
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatFormFieldControl } from '@angular/material/form-field';
import { VirtualScrollItemStatus } from '@uipath/angular/directives/ui-virtual-scroll-range-loader';

import {
    ISuggestValue,
    ISuggestValues,
    SuggestDirection,
    SuggestMaxSelectionConfig,
} from './models';
import { UI_SUGGEST_ANIMATIONS } from './ui-suggest.animations';
import { UiSuggestIntl } from './ui-suggest.intl';
import { UiSuggestMatFormFieldDirective } from './ui-suggest.mat-form-field';
import {
    caseInsensitiveCompare,
    generateLoadingInitialCollection,
    inMemorySearch,
    mapInitialItems,
    resetUnloadedState,
    setLoadedState,
    setPendingState,
    toSuggestValue,
} from './utils';

export const DEFAULT_SUGGEST_DEBOUNCE_TIME = 300;
export const DEFAULT_SUGGEST_DRILLDOWN_CHARACTER = ':';
export const MAT_CHIP_INPUT_SELECTOR = '.mat-mdc-chip-grid input';

/**
 * A form compatible `dropdown` packing `lazy-loading` and `virtual-scroll`.
 *
 * @ignore
 * @export
 */
@Component({
    selector: 'ui-suggest',
    styleUrls: ['./ui-suggest.component.scss'],
    templateUrl: './ui-suggest.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        NgForm,
        FormGroupDirective,
        {
            provide: MatFormFieldControl,
            useExisting: UiSuggestComponent,
        },
    ],
    animations: [UI_SUGGEST_ANIMATIONS.transformMenuList],
})
export class UiSuggestComponent extends UiSuggestMatFormFieldDirective
    implements
    OnDestroy,
    OnInit,
    OnChanges,
    AfterViewInit {

    get inDrillDownMode() {
        return !!this.drillDown && this.inputControl.value.includes(this.drillDownCharacter);
    }

    /**
     * Configure if the component is `disabled`.
     *
     */
    @HostBinding('class.disabled')
    @Input()
    get disabled() {
        return this._disabled$.value;
    }
    set disabled(value) {
        if (this._disabled$.value === !!value) { return; }

        this._disabled$.next(!!value);
        if (
            value &&
            this.isOpen
        ) {
            this.close(false);
        }

        this._cd.markForCheck();
        this.stateChanges.next();
    }

    /**
     * Configure if the component allows expandable items
     *
     */
    @HostBinding('class.drill-down')
    @Input()
    get drillDown() {
        return this._drillDown;
    }
    set drillDown(value) {
        this._drillDown = !!value;
    }

    /**
     * Divider character for drilldown logic
     */
    @Input()
    drillDownCharacter = DEFAULT_SUGGEST_DRILLDOWN_CHARACTER;

    /**
     * Configure if the component is `readonly`.
     *
     */
    @HostBinding('class.readonly')
    @Input()
    get readonly() {
        return this._readonly;
    }
    set readonly(value) {
        this._readonly = !!value;
        if (
            value &&
            this.isOpen
        ) {
            this.close(false);
        }
        this.stateChanges.next();
        this._cd.detectChanges();
    }

    /**
     * Set the element in high density state.
     *
     */
    @HostBinding('class.ui-suggest-state-high-density')
    @Input()
    hasHighDensity = false;

    /**
     * By default the onOpen fetchStrategy prevents additional requests if closed.
     * This allows you to bypass that check and update even if closed.
     */
    @Input()
    ignoreOpenOnFetch = false;

    /**
     * Controls whether to use the default custom value template or use the custom item template
     *
     */
    @Input()
    applyItemTemplateToCustomValue = false;

    /**
     * A list of options that will be presented at the top of the list.
     *
     */
    @Input()
    get headerItems() {
        return this.loading$.value || !!this.inputControl.value.trim()
            ? []
            : this._headerItems;
    }
    set headerItems(value: ISuggestValue[] | null) {
        if (!value || isEqual(value, this._headerItems)) { return; }

        this._headerItems = this._sortItems(value)
            .map(r => ({
                ...r,
                loading: VirtualScrollItemStatus.loaded,
            }));
        this._checkUnsuportedScenarios();
    }

    /**
     * If true, the item list will render open and will not close on selection
     *
     */
    @Input()
    alwaysExpanded = false;

    /**
     * If true, component will always render the list upfront
     */
    @Input()
    expandInline = false;

    /**
     * If true, component wil place the dropdown over the input
     */
    @Input()
    forceDisplayDropdownOverInput = false;

    /**
     * Configure if the component allows multi-selection.
     *
     */
    @Input()
    get multiple() {
        return this._multiple;
    }
    set multiple(multiple) {
        if (this._multiple !== multiple) {
            if (!multiple) {
                this._deselectValuesFrom(1);
                this.registerChange(this.value);
            }
            this._multiple = multiple;
            this._cd.detectChanges();
        }
    }

    /**
     * The `dropdown` item list.
     *
     */
    @Input()
    get items() {
        return this._items;
    }
    set items(items: ISuggestValue[]) {
        if (!items || isEqual(items, this._items)) { return; }

        this._lastSetItems = cloneDeep(items);

        if (this.searchable) {
            this.fetch(this.inputControl.value);
        }

        this._items = this._sortItems(items)
            .map(r => ({
                ...r,
                loading: VirtualScrollItemStatus.loaded,
            }));
    }

    /**
     * Configure the direction in which to open the overlay: `up` or `down'.
     *
     */
    @Input()
    set direction(value: SuggestDirection) {
        if (this._direction === value) { return; }
        this._items.reverse();
        this._direction = value;
        this._checkUnsuportedScenarios();
    }
    get direction() {
        return this._direction;
    }

    /**
     * Configure if the dropdown has `search` enabled.
     *
     */
    @Input()
    get searchable() {
        return !!this.searchSourceFactory;
    }
    set searchable(searchable) {
        if (!searchable) {
            this.searchSourceFactory = void 0;
            return;
        }

        if (this.searchSourceFactory) {
            return;
        }
        this.searchSourceFactory = (searchTerm = '') => inMemorySearch(searchTerm, this._lastSetItems);
    }

    /**
     * Reference for custom item template
     *
     */
    @ContentChild(TemplateRef, { static: true })
    itemTemplate: TemplateRef<any> | null = null;

    /**
     * Computes the current tooltip value.
     *
     */
    get tooltip() {
        if (
            !this.isOpen &&
            this._hasValue
        ) {
            return this._getValueSummary(true);
        }

        return null;
    }

    /**
     * Determines if the `custom value` option should be `displayed`.
     *
     */
    get isCustomValueVisible(): boolean {
        if (
            !this._hasCustomValue$.value ||
            this.loading$.value
        ) {
            return false;
        }

        return !this.multiple || !this._value.some(v => v.text === this.inputControl.value.trim()) || this.isCustomValueAlreadySelected;
    }

    get isCustomHeaderItemsVisible(): boolean {
        return !(this.loading$.value || !this.headerItems!.length);
    }

    /**
     * Retrieves the currently `rendered` items.
     *
     */
    get renderItems() {
        return this.loading$.value
            ? []
            : this._hasCustomValue$.value && !this.isDown
                // FIXME: hack
                ? [...this.items, false as unknown as ISuggestValue]
                : this.items;
    }

    /**
     * Configure if the user is allowed to select `custom values`.
     *
     * @deprecated
     */
    @Input()
    get enableCustomValue() {
        return this._enableCustomValue;
    }
    set enableCustomValue(value) {
        this._enableCustomValue = !!value;
        this._checkUnsuportedScenarios();
    }

    /**
     * Configure if the dropdown is in a `loading` state.
     *
     */
    @Input()
    set loading(value: boolean) {
        this.loading$.next(value);
    }

    /**
     * Render an additional info message if a specific count of items is rendered
     * Useful in case search results are capped and the user needs to adjust the query
     */
    @Input()
    searchableCountInfo?: { count: number; message: string };

    /**
     * Configure if the selected value shown should respect the template in dropdown
     *
     */
    @Input()
    displayTemplateValue = false;

    /**
     * Determines if there are no results to display.
     *
     */
    get hasNoResults() {
        return !this.loading$.value && !this.items.length;
    }

    /**
     * @ignore
     */
    get isCustomValueAlreadySelected() {
        if (
            !this._hasCustomValue$.value ||
            this.loading$.value
        ) {
            return false;
        }

        return this.isItemSelected(toSuggestValue(this.inputControl.value.trim()));
    }

    /**
     * Computes the `viewport` max-height.
     *
     */
    get viewportMaxHeight() {
        if (!this.isOpen) { return 0; }

        if (this.expandInline && this._height$.value) {
            return this._height$.value;
        }

        const actualCount = this.renderItems.filter(Boolean).length + (this.enableCustomValue ?
            (Number(this.isCustomValueVisible)) : (this.headerItems!.length));

        if (actualCount === 0) {
            return this.baseSize + Number(!!this.headerItems!.length);
        }

        const displayedCount = Math.min(this.displayCount, Math.max(actualCount, 1));
        return this.itemSize * displayedCount + Number(!!this.headerItems!.length);
    }

    private get _isOnCustomValueIndex() {
        if (this.headerItems!.length) {
            return this.activeIndex < this.headerItems!.length;
        }

        return this.enableCustomValue &&
            !!this.inputControl.value.trim() &&
            (
                this.activeIndex === -1 ||
                this.activeIndex === this._items.length
            );
    }

    private get _itemLowerBound() {
        return this._hasCustomValue$.value && this.isDown ? -1 : 0;
    }

    private get _itemUpperBound() {
        const headerItemsLength = this.headerItems!.length ?? 0;
        const itemsLength = this.items.length + headerItemsLength;

        return itemsLength + (this._hasCustomValue$.value && !this.isDown ? 0 : -1);
    }

    private get _fetchCount() {
        return this._isLazyMode ? this.displayCount * 2 : this.displayCount;
    }

    /**
     * A search stream factory, generally used to retrieve data from the server when a user searches.
     * By `default`, a search factory is generated that does an `in-memory` lookup if `searchable` is set to `true`.
     *
     */
    @Input()
    searchSourceFactory?: (searchTerm?: string, fetchCount?: number, skip?: number) => Observable<ISuggestValues<any>>;

    /**
     * Configure the `searchSourceStrategy` for requesting data using searchSourceFactory:
     * `default` - need total count
     * `lazy` - items will be fetched only when reaching bottom of the list (no need of total count)
     */
    @Input()
    searchSourceStrategy: 'default' | 'lazy' = 'default';

    /**
     * A display value factory, generally used to compute the display value for multiple items.
     * By `default`, a display value factory is generated that does an array.join.
     *
     */
    @Input()
    displayValueFactory?: (value?: ISuggestValue[]) => string;

    @Input()
    customValueLabelTranslator!: (value: string) => string;

    /**
     * Configure the `fetchStrategy` for requesting data using searchSourceFactory
     * `eager` - makes calls to searchSourceFactory onInit
     * `onOpen` - makes calls to searchSourceFactory onOpen
     *
     */
    @Input()
    set fetchStrategy(strategy: 'eager' | 'onOpen') {
        if (strategy === this._fetchStrategy$.value) { return; }

        this._fetchStrategy$.next(strategy);
    }

    /**
     * Configure the minimum number of characters that triggers the searchSourceFactory call
     * This will have priority over the fetch strategy if set.
     *
     */
    @Input()
    get minChars() {
        return this._minChars;
    }
    set minChars(value: number) {
        this._minChars = value;
        this._checkUnsuportedScenarios();
    }

    /**
     * Configure the `control` width.
     *
     */
    @Input()
    get width() {
        return !this._width ?
            this.expandInline ? '100%' : this.suggestContainerWidth + 'px' :
            this._width;
    }

    set width(value: string) {
        this._width = value;
    }
    /**
     * Configure the `maximum` search length.
     *
     */
    @Input()
    maxLength?: number;
    /**
     * The search event debounce interval in `ms`.
     *
     */
    @Input()
    debounceTime = DEFAULT_SUGGEST_DEBOUNCE_TIME;
    /**
     * The maximum number of items rendered in the viewport.
     *
     */
    @Input()
    get displayCount() {
        return this._displayCount ?? 10;
    }

    set displayCount(value: number) {
        if (!this.expandInline) {
            this._displayCount = value;
        }
    }
    /**
     * Configure if the component allows selection clearing.
     *
     */
    @Input()
    clearable = true;
    /**
     * Configure the `default` selected value.
     *
     */
    @Input()
    defaultValue = '';
    /**
     * Configure if the tooltip should be disabled.
     *
     */
    @Input()
    disableTooltip = false;

    /**
     * Use compact summary info instead of chips
     *
     */
    @Input()
    compact = false;

    /**
     * The template to use for compact summary
     *
     */
    @Input()
    compactSummaryTemplate?: TemplateRef<any>;

    /**
     * The config used to describe suggest when the maximum number of selected items is reached.
     *
     */
    @Input()
    maxSelectionConfig: SuggestMaxSelectionConfig = {
        count: Infinity,
        itemTooltip: '',
        footerMessage: '',
    };
    /**
     * Emits `once` when `data` is retrieved for the `first time`.
     *
     */
    @Output()
    sourceInitialized = new EventEmitter<ISuggestValue[]>();

    /**
     * Emits `every` time item data is retrieved.
     *
     */
    @Output()
    sourceUpdated = new EventEmitter<ISuggestValue[]>();

    /**
     * Emits when the overlay is hidden (dropdown close).
     *
     */
    @Output()
    closed = new EventEmitter<void>();

    /**
     * Emits when an item is selected.
     *
     */
    @Output()
    itemSelected = new EventEmitter<ISuggestValue>();

    /**
     * Emits when the overlay is displayed (dropdown open).
     *
     */
    @Output()
    opened = new EventEmitter<void>();

    /**
     * Emits on losing or receiving focus.
     *
     */
    @Output()
    focusEvent = new EventEmitter<FocusEvent>();

    /**
     * @ignore
     */
    VirtualScrollItemStatus = VirtualScrollItemStatus;
    /**
     * Configures the dropdown open state.
     *
     * @ignore
     */
    set isOpen(isOpen: boolean) {
        if (this._isOpen$.value === isOpen) { return; }

        this._isOpen$.next(isOpen);
    }
    get isOpen() {
        return this._isOpen$.value;
    }
    /**
     * The current selected item index.
     *
     * @ignore
     */
    activeIndex = -1;
    /**
     * The component loading state source.
     *
     * @ignore
     */
    loading$ = new BehaviorSubject(false);
    /**
     * Stream that triggers focusing.
     *
     * @ignore
     */
    focus$ = new Subject<boolean>();

    upPosition: ConnectedPosition = {
        originX: 'start',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'bottom',
        offsetY: 3,
    };

    downPosition: ConnectedPosition = {
        originX: 'start',
        originY: 'top',
        overlayX: 'start',
        overlayY: 'top',
        offsetY: -3,
    };
    dropdownPosition: ConnectedPosition[] = [];

    suggestContainerWidth = 0;

    @ViewChild('suggestContainer') suggestContainer!: ElementRef;
    @ViewChild('displayContainer') displayContainer?: ElementRef;

    @ViewChild(CdkVirtualScrollViewport)
    protected set _virtualScrollerQuery(value: CdkVirtualScrollViewport) {
        if (!value || this._virtualScroller === value) { return; }

        this._virtualScroller = value;

        if (this.expandInline) {
            this._matListElement = this._virtualScroller?.getElementRef().nativeElement.parentElement!;
            this._observer?.observe(this._matListElement);
        }

        this._virtualScroller!
            .scrolledIndexChange
            .pipe(
                skip(1),
                takeUntil(this._destroyed$),
            )
            .subscribe(start => {
                this._visibleRange = {
                    start,
                    end: start + this.displayCount,
                };
            });
    }

    private _hasCustomValue$ = new BehaviorSubject(false);
    private _reset$ = new Subject<void>();

    private get _isOpenDisabled() {
        return this.isOpen ||
            this.disabled ||
            this.readonly;
    }

    private get _hasValue() {
        return this.value &&
            !this.empty;
    }

    private _readonly = false;

    private _displayCount?: number;

    private _width?: string;

    private _observer!: ResizeObserver;
    private _suggestContainerObserver!: ResizeObserver;

    private _height$ = new BehaviorSubject(0);

    private _searchSub?: Subscription;

    private _disabled$ = new BehaviorSubject(false);
    private _multiple = false;
    private _lastSetItems: ISuggestValue[] = [];
    private _enableCustomValue = false;
    private _minChars = 0;

    private _triggerViewportRefresh$ = new BehaviorSubject<null>(null);
    private _destroyed$ = new Subject<void>();
    private _scrollTo$ = new Subject<number>();
    private _rangeLoad$ = new Subject<ListRange>();
    private _fetchStrategy$ = new BehaviorSubject<'eager' | 'onOpen'>('eager');
    private _isOpen$ = new BehaviorSubject(false);

    private _headerItems: ISuggestValue[] = [];
    private _virtualScroller?: CdkVirtualScrollViewport;
    private _visibleRange = {
        start: Number.NEGATIVE_INFINITY,
        end: Number.POSITIVE_INFINITY,
    };

    private _inputChange$!: Observable<string>;
    private _drillDown = false;
    private _lazyLoadLastArgument: any[] = ['', 0, 0];

    private _matListElement?: HTMLElement;

    /**
     * @ignore
     */
    constructor(
        elementRef: ElementRef,
        cd: ChangeDetectorRef,
        errorStateMatcher: ErrorStateMatcher,
        parentForm: NgForm,
        parentFormGroup: FormGroupDirective,
        @Optional()
        @Self()
        public ngControl: NgControl,
        @Optional()
        public intl: UiSuggestIntl,
        private _liveAnnouncer: LiveAnnouncer,
        private _zone: NgZone,
    ) {
        super(
            elementRef,
            errorStateMatcher,
            parentForm,
            parentFormGroup,
            cd,
            ngControl,
        );
        this._initResizeObserver();

        this._height$.subscribe(heightValue => {
            if (this.expandInline) {
                this._displayCount = Math.round(heightValue / this.itemSize);
            }
        });

        this.intl = this.intl || new UiSuggestIntl();
        this.intl
            .changes
            .pipe(takeUntil(this._destroyed$))
            .subscribe(() => cd.detectChanges());
        this.customValueLabelTranslator = this.customValueLabelTranslator || this.intl.customValueLabel;
    }

    /**
     * Configure if each individual chip can be removed
     *
     */
    @Input()
    canRemoveChip: (value: ISuggestValue) => boolean
        = () => !this.readonly;
    /**
     * @ignore
     */
    ngOnInit() {
        if (this.alwaysExpanded || this.expandInline) {
            this.open();
        }

        this._visibleRange = {
            start: 0,
            end: this.displayCount,
        };

        this._initOverlayPositions();
        this.dropdownPosition = [this.direction && this.direction === 'up' ? this.upPosition : this.downPosition];

        this._inputChange$ = combineLatest([
            this.inputControl.valueChanges.pipe(
                startWith(''),
                map((v = '') => v.trim()),
                distinctUntilChanged(),
                filter(v => v.length >= this.minChars),
                tap(v => v && this.multiple && this.open()),
                tap(this._setLoadingState),
                debounceTime(this.debounceTime),
                filter(_ => !!this.searchSourceFactory),
            ),
            this._disabled$.pipe(
                filter(v => !v),
            ),
            this._fetchStrategy$
                .pipe(
                    switchMap(strategy => {
                        switch (strategy) {
                            case 'onOpen':
                                return this._isOpen$.pipe(filter(o => !!o));
                            case 'eager':
                                return of(strategy);
                        }
                    }),
                ),
        ]).pipe(
            map(([value]) => value as any),
        );

        merge(
            this._reset$.pipe(
                map(_ => ''),
                tap(_ => !!this.inputControl.value.trim() && this.inputControl.setValue('')),
                tap(this._setLoadingState),
            ),
            this._inputChange$,
        ).pipe(
            takeUntil(this._destroyed$),
        ).subscribe(this.fetch);

        this._scrollTo$
            .pipe(
                delay(0),
                observeOn(animationFrameScheduler),
                filter(_ => this.isOpen),
                takeUntil(this._destroyed$),
            )
            .subscribe(this._virtualScrollTo);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.direction) {
            this.dropdownPosition = [this._getDropdownPositionAccordingToDirection()];
        }

        if (this.searchSourceStrategy === 'lazy' && this.direction === 'up') {
            throw new Error('Currently support only down direction for lazy mode');
        }

        if (this.searchSourceStrategy === 'lazy' && !this.searchSourceFactory) {
            throw new Error('Should provide a searchSourceFactory for lazyMode');
        }

        const { displayPriority } = changes;

        if (displayPriority?.currentValue !== displayPriority?.previousValue) {
            this._items = this._sortItems(this._items);
        }
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this._destroyed$.next();
        this._destroyed$.complete();
        this.stateChanges.complete();
        this.selected.complete();
        this.deselected.complete();
        this.sourceUpdated.complete();
        this.closed.complete();
        this.opened.complete();

        if (this._matListElement) {
            this._observer?.unobserve(this._matListElement);
        }

        if (this.isOpen) {
            this._suggestContainerObserver.unobserve(this.suggestContainer.nativeElement);
        }

        if (!this.sourceInitialized.closed) {
            this.sourceInitialized.complete();
        }
    }

    /**
     * @ignore
     */
    ngAfterViewInit() {
        combineLatest([
            this._triggerViewportRefresh$,
            this._rangeLoad$,
        ]).pipe(
            map(([, range]) => range),
            takeUntil(this._destroyed$),
        ).subscribe(this._rangeLoad);
    }

    /**
     * Computed index offset in items list when prepending header items
     *
     * @param index
     * @returns
     */
    computedItemsOffset(index: number) {
        return index + this.headerItems!.length;
    }

    /**
     * Is called every time a new range needs to be loaded.
     *
     * @ignore
     */
    rangeLoad = (range: ListRange) => this._rangeLoad$.next(range);

    /**
     * Disable state hook for the `form`.
     *
     * @param isDisabled The truth of of the `disabled` state.
     * @ignore
     */
    setDisabledState(isDisabled: boolean) {
        this.disabled = isDisabled;
    }

    /**
     * Handles `click` events on the `form-control` container.
     *
     * @ignore
     */
    onContainerClick(event: MouseEvent) {
        if (
            !this.focused &&
            !this._isOpenDisabled
        ) {
            this.open();
            this.focus$.next(true);
            this.preventDefault(event);
        }
    }

    /**
     * Notifies focus changes to the `form`.
     *
     * @ignore
     */
    onBlur(event: FocusEvent) {
        this.focusEvent.emit(event);
        this._focusChanged(this.isOpen);
    }

    /**
     * Notifies focus changes to the `form`.
     *
     * @ignore
     */
    onFocus(event: FocusEvent) {
        this.focusEvent.emit(event);
        this._focusChanged(true);
    }

    /**
     * Toggle the dropdown state (opened/closed);
     *
     */
    toggle() {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        this.isOpen ? this.close() : this.open();
    }

    /**
     * Opens the dropdown.
     *
     */
    open() {
        if (this._isOpenDisabled) { return; }
        this.isOpen = true;
        this.opened.emit();
        this._focusChanged(true);

        const [value] = this.value;

        if (
            this.enableCustomValue &&
            value &&
            value.isCustom &&
            !this.multiple
        ) {
            this.inputControl.setValue(value.text);
        }

        this._setAndScrollToActiveIndex(value);

        if (!this.loading$.value) {
            this._announceNavigate();
        }

        if (!this.expandInline) {
            this._suggestContainerObserver.observe(this.suggestContainer.nativeElement);
        }
    }

    /**
     * Closes the dropdown.
     *
     * @param [refocus=true] If the dropdown should be focused after closing.
     */
    close(refocus = true) {
        if (this.alwaysExpanded || this.expandInline || !this.isOpen) { return; }

        this._suggestContainerObserver.unobserve(this.suggestContainer.nativeElement);

        if (
            (this._isOnCustomValueIndex && !this.headerItems!.length) &&
            !this.loading$.value &&
            !this.multiple
        ) {
            this._clearSelection();
            this._pushEntry(toSuggestValue(this.inputControl.value.trim(), true));
        }

        this.registerTouch();
        this.clear();

        this.isOpen = false;
        this.activeIndex = -1;
        this._visibleRange = {
            start: Number.NEGATIVE_INFINITY,
            end: Number.POSITIVE_INFINITY,
        };
        this.closed.emit();

        this.focus$.next(refocus);

        if (!refocus) {
            this._focusChanged(false);
        }
    }

    /**
     * Resets the component state.
     *
     */
    reset() {
        this._reset$.next();
    }

    /**
     * Removes the active dropdown selection.
     *
     * @param [ev] `Mouse` or `Keyboard`.
     */
    removeSelection(ev?: Event | KeyboardEvent | MouseEvent) {
        if (!this.clearable) { return; }

        this.preventDefault(ev);
        this._clearSelection();
        this.selected.emit();
        this.registerTouch();
        this.registerChange(this.value);

        if (this.inDrillDownMode) {
            this.inputControl.setValue('');
            return;
        }
        this.close(false);
    }

    /**
     * Navigates through the items by looking up the next focused / active index.
     *
     * @param increment The increment that should be applied to the current index.
     * @param [ev] The navigation trigger event.
     * @ignore
     */
    navigate(increment: number, ev?: Event) {
        this.preventDefault(ev);

        if (
            this._cantNavigate(increment)
        ) { return; }

        const [value] = this.value;
        if (
            value &&
            this.activeIndex === this._itemLowerBound - 1
        ) {
            const headerItemIndex = this.headerItems!.findIndex(v => v.id === value.id);
            this.activeIndex = headerItemIndex !== -1
                ? headerItemIndex
                : this.computedItemsOffset(this._items.findIndex(v => v.id === value.id));
        }

        this._safeCycleIncrement(increment);

        this._announceNavigate();
        this._scrollTo$.next(this.activeIndex);
    }

    /**
     * Selects the current active item.
     *
     * @ignore
     */
    setSelectedItem() {
        if (this.loading$.value) { return; }

        if (this._isOnCustomValueIndex && !this.headerItems!.length) {
            this.updateValue(this.inputControl.value.trim(), !this.multiple);
            return;
        }

        this._selectActiveItem(!this.multiple);
    }

    /**
     * Determines if the provided `item` is currently selected.
     *
     * @param [item] The `item` that needs to be checked.
     * @returns If the provided `item` is selected.
     */
    isItemSelected(item?: ISuggestValue) {
        return !!item &&
            (!!this.value.find(v => v.id === item.id) ?? !!this.headerItems!.find(v => v.id === item.id));
    }

    /**
     * Updates the component value.
     *
     * @param inputValue The value that needs to be selected.
     * @param [closeAfterSelect=true] If the dropdown should close after the value is selected.
     * @param [refocus=true] If the search input should regain focus after selection.
     */
    // eslint-disable-next-line complexity
    updateValue(inputValue: ISuggestValue | string, closeAfterSelect = true, refocus = true) {
        let value = toSuggestValue(inputValue, this._isOnCustomValueIndex);
        if (this.maxSelectionConfig.count <= this.value.length && !this.isItemSelected(value)) { return; }
        if (value.loading !== VirtualScrollItemStatus.loaded || value.disabled === true) { return; }

        this.itemSelected.emit(value);

        if (this.inDrillDownMode) {
            value = {
                ...value,
                text: `${this.inputControl.value}${value.text}`,
            };
        }

        const isExpandable = this.searchable && this.drillDown && !!value.expandable;

        if (isExpandable) {
            this.inputControl.setValue(`${value.text}:`);
            return;
        }

        const isItemSelected = this.isItemSelected(value);

        if (!isItemSelected && value) {
            if (!this.multiple) {
                this._clearSelection();
            }
            this._pushEntry(value);

            this._announceSelectStatus(value.text, true);
        }

        if (value && this.multiple && !this.compact) {
            if (this.inputControl.value) {
                this.inputControl.setValue('');
            }
            this._focusChipInput();
        }

        const alreadySelectedNormalValue = this.multiple &&
            isItemSelected &&
            !!value &&
            !value.isCustom;

        if (alreadySelectedNormalValue) {
            this._removeEntry(value);

            this._announceSelectStatus(value.text, false);
        }

        if (closeAfterSelect) {
            this.close(refocus);
        }
    }

    /**
     * @ignore
     */
    preventDefault(ev?: Event) {
        if (!ev || this._isCheckbox(ev?.target)) { return; }
        ev.preventDefault();
        ev.stopImmediatePropagation();
    }

    /**
     * Triggers a refetch of data, calling the `searchSourceFactory` with the provided search term.
     *
     * @param searchValue The search value that should be used for the `fetch`.
     */
    fetch = (searchValue = '') => {
        if (!this.searchSourceFactory ||
            this._fetchStrategy$.value === 'onOpen' &&
            !this.ignoreOpenOnFetch &&
            !this.isOpen
        ) {
            return;
        }

        this.loading$.next(true);

        if (this._searchSub) { this._searchSub.unsubscribe(); }
        this._searchSub = this.searchSourceFactory(searchValue, this._fetchCount)
            .pipe(
                tap(this._setInitialItems),
                map(this._findItemIndex(searchValue)),
                tap(this._checkCustomValue(searchValue)),
                tap(this._setActiveIndex),
                takeUntil(this._destroyed$),
            ).subscribe({
                next: _ => {
                    this.loading$.next(false);
                    this._scrollToFirst();
                    this._cd.detectChanges();
                },
                error: (error) => {
                    if (isDevMode()) {
                        console.warn('UiSuggest fetch failed, more info: ', error);
                    }

                    this.loading$.next(false);
                    this._items = [];
                },
            });
    };

    /**
     * `NgFor` track method.
     *
     * @ignore
     */
    trackById: TrackByFunction<ISuggestValue> = (_: number, { id }: ISuggestValue) => id;

    deselectItem(option: ISuggestValue) {
        this._removeEntry(option);
    }

    backspaceBehavior() {
        if (!this.inputControl.value.trim().length) {
            this.close();
        }
    }

    computeDisplayValue() {
        return this.value.length > 0
            ? this._getValueSummary()
            : this.defaultValue;
    }

    onOptionsDropdownTabPressed() {
        if (this.isOpen && !this.expandInline) {
            this.displayContainer?.nativeElement.focus();
        }
        this.close(false);
    }

    private _getDropdownPositionAccordingToDirection() {
        return this.direction === 'up' ? this.upPosition : this.downPosition;
    }

    private _initOverlayPositions() {
        const mustBePlacedBelowTheInput = !this.forceDisplayDropdownOverInput || this.multiple;

        // We need this because we want to show the dropdown below the mat-form-field and not below the ui-suggest component
        if (this.isFormControl) {
            this._setDropdownOffset(mustBePlacedBelowTheInput);
        }

        if (mustBePlacedBelowTheInput) {
            this._setDropdownOrigin();
        }
    }

    private _setDropdownOrigin() {
        this.upPosition = {
            ...this.upPosition,
            originX: 'start',
            originY: 'top',
        };
        this.downPosition = {
            ...this.downPosition,
            originX: 'start',
            originY: 'bottom',
        };

    }

    private _setDropdownOffset(mustBePlacedBesideTheInput: boolean) {
        this.upPosition = {
            ...this.upPosition,
            offsetX: -1,
            offsetY: mustBePlacedBesideTheInput ? -10 : 11,
        };
        this.downPosition = {
            ...this.downPosition,
            offsetX: -1,
            offsetY: mustBePlacedBesideTheInput ? 10 : -11,
        };
    }

    private _initResizeObserver() {
        this._observer = new ResizeObserver(entries => {
            this._zone.run(() => {
                this._height$.next(entries?.[0]?.contentRect.height);
                this._cd.markForCheck();
            });
        });

        this._suggestContainerObserver = new ResizeObserver(entries => {
            this.suggestContainerWidth = entries[0].target.clientWidth;
            this._cd.markForCheck();
        });
    }

    private _selectActiveItem(closeAfterSelect: boolean) {
        const item = this.headerItems![this.activeIndex] ?? this.items[this.activeIndex - this.headerItems!.length];
        if (!item) { return; }

        this.updateValue(item, closeAfterSelect);
        this._scrollTo$.next(this.activeIndex);
    }

    private _findItemIndex = (searchValue: string) =>
        () => {
            const headerItemIndex = this.headerItems!.findIndex(({ text }) => caseInsensitiveCompare(text, searchValue));
            const itemIndex = this._items.findIndex(({ text }) => caseInsensitiveCompare(text, searchValue));

            return headerItemIndex !== -1
                ? headerItemIndex
                : itemIndex !== -1
                    ? this.computedItemsOffset(itemIndex)
                    : -1;
        };

    private _safeCycleIncrement(increment: number) {
        let newIndex = this.activeIndex + increment;
        const isOutOfBoundsUpper = newIndex > this._itemUpperBound;

        if (isOutOfBoundsUpper) {
            newIndex = this._itemLowerBound;
        } else {
            const isOutOfBoundsDownward = newIndex < this._itemLowerBound;
            if (isOutOfBoundsDownward) {
                newIndex = this._itemUpperBound;
            }
        }

        this.activeIndex = newIndex;
    }

    private _checkCustomValue(searchValue: string) {
        return (itemIndex: number) => this.enableCustomValue &&
            this._setHasCustomValue(!!searchValue && itemIndex === -1 || !!this.headerItems!.length);
    }

    private _setHasCustomValue(isCustomValue: boolean) {
        if (this._hasCustomValue$.value === isCustomValue) { return; }
        this._hasCustomValue$.next(isCustomValue);
    }

    private _virtualScrollTo = (index: number) => {
        const vs = this._virtualScroller;
        const headerItemsOffset = this._headerItems.length;
        const customValueOffset = this._itemLowerBound;

        if (!vs ||
            (this.isDown
                ? index !== 0
                : index !== this._items.length + this.headerItems!.length - 1) &&
            index >= this._visibleRange.start + customValueOffset &&
            index < this._visibleRange.end + customValueOffset
        ) {
            return;
        }

        const passedBottomBound = index === this._visibleRange.end + customValueOffset;
        const passedTopBound = index < this._visibleRange.start + customValueOffset;

        const start = passedBottomBound
            ? index + 1 - customValueOffset - this.displayCount
            : Math.max(Math.min(index, this.items.length + headerItemsOffset - this.displayCount), 0);

        const end = start + this.displayCount;

        this._visibleRange = {
            start,
            end,
        };

        vs.setRenderedRange({
            start,
            end,
        });
        vs.setRenderedContentOffset(start * this.itemSize);

        if (
            end > this._itemUpperBound
            && (this.isCustomValueVisible || this.isCustomHeaderItemsVisible)
        ) {
            this._gotoBottomAsync(vs.elementRef.nativeElement);
        } else {
            // this is not an error it should go to index
            // which can be outside the safe zone due to customValue
            const targetIndex = this._isOnCustomValueIndex
                ? index
                : start + Number(this.isDown && this.isCustomValueVisible && passedTopBound);

            vs.scrollToIndex(targetIndex);
        }
    };

    private _announceNavigate() {
        if (!this.items.length && !this._isOnCustomValueIndex) {
            this._liveAnnouncer.announce(this.intl.noResultsLabel);
            return;
        }

        const item = this.activeIndex < this.headerItems!.length
            ? this.headerItems![this.activeIndex]
            : this.items[this.activeIndex - this.headerItems!.length];

        const isCurrentItemSelected = !this._isOnCustomValueIndex
            ? this.isItemSelected(item)
            : undefined;

        const textToAnnounce = !this._isOnCustomValueIndex
            ? item.text
            : `${this.intl.customValueLiveLabel} ${this.customValueLabelTranslator(this.inputControl.value)}`;

        this._liveAnnouncer.announce(
            this.intl.currentItemLabel(
                textToAnnounce,
                this.activeIndex + 1,
                this.headerItems!.length + this._items.length,
                isCurrentItemSelected,
            ),
        );
    }

    private _setLoadingState = () => !this.disabled && this.searchSourceFactory && this.loading$.next(true);

    private _focusChanged(isFocused: boolean) {
        if (isFocused === this.focused) { return; }

        this.focused = isFocused;
        this.stateChanges.next();
    }

    private _setInitialItems = (searchResponse: ISuggestValues<any>) => {
        this._items = mapInitialItems(searchResponse,
            this.displayPriority,
            this.value,
            this.intl.loadingLabel,
            this.isDown,
            this._isLazyMode,
        );

        if (this._shouldAddLoadingElementInLazyMode(searchResponse?.data ?? [])) {
            this._addLoadingElementInLazyMode();
        }

        if (!this.sourceInitialized.closed) {
            this.sourceInitialized.emit(this.items);
            this.sourceInitialized.complete();
        }
        this.sourceUpdated.emit(this.items);
    };

    private _setActiveIndex = (itemIndex: number) => {
        this.activeIndex = itemIndex > -1 ?
            itemIndex :
            this.isDown ?
                this._itemLowerBound
                : this._itemUpperBound;
    };

    private _setAndScrollToActiveIndex(value: ISuggestValue) {
        const hasSingleSelectValue = !!value && !this.multiple;
        const headerItemsIndex = hasSingleSelectValue
            ? this.headerItems!.findIndex(({ id }) => id === value.id)
            : -1;

        this._setActiveIndex(
            hasSingleSelectValue
                ? headerItemsIndex !== -1
                    ? headerItemsIndex
                    : this.computedItemsOffset(this._items.findIndex(({ id }) => id === value.id))
                : -1,
        );

        this._scrollTo$.next(this.activeIndex);
    }

    private _scrollToFirst() {
        this._scrollTo$.next(this.isDown ?
            this._itemLowerBound
            : this._itemUpperBound);
    }

    private _deselectValuesFrom(idx: number, deleteCount?: number) {
        const deselected = deleteCount ?
            this.value.splice(idx, deleteCount) :
            this.value.splice(idx);

        deselected.forEach(item => this.deselected.emit(item));
    }

    private _pushEntry(entry: ISuggestValue) {
        const headerItemIndex = this.headerItems!.findIndex(val => val.id === entry.id);
        this._setActiveIndex(
            headerItemIndex !== -1
                ? headerItemIndex
                : this.computedItemsOffset(this._items.indexOf(entry)),
        );

        if (this.multiple) {
            this.value.push(entry);
        } else {
            this.value.splice(0, 1, entry);
        }

        this.selected.emit(entry);
        this.registerChange(this.value);
    }

    private _clearSelection() {
        this._deselectValuesFrom(0);
    }

    private _removeEntry(value: ISuggestValue) {
        const index = this.value.findIndex(({ id }) => id === value.id);
        this._deselectValuesFrom(index, 1);
        this.registerChange(this.value);
    }

    private _rangeLoad = ({ start, end }: ListRange) => {
        if (this.searchSourceFactory == null) {
            throw new Error('searchSourceFactory is not defined');
        }

        const fetchStart = start;
        const fetchCount = this._isLazyMode ? this._fetchCount : end - start + 1;

        const newArguments = [this.inputControl.value.trim(), fetchCount, fetchStart];

        const isRedundantCall = this._isLazyMode
            && (isEqual(this._lazyLoadLastArgument, newArguments)
                || (!this.isDown && end < this._lazyLoadLastArgument?.[2]));

        if (isRedundantCall) {
            return;
        }

        this._lazyLoadLastArgument = newArguments;

        const mappedStart = this.isDown ? start : this._items.length - end - 1;
        const mappedEnd = this.isDown ? end : this._items.length - start - 1;

        if (this._isLazyMode) {
            setPendingState(this._items, 0, this._items.length);
        } else {
            setPendingState(this._items, mappedStart, mappedEnd);
        }

        this.searchSourceFactory(...newArguments)
            .pipe(
                retry(1),
                map(res => this.isDown ? res : {
                    data: (res.data ?? []).reverse(),
                    total: res.total,
                }),
                tap(() => !this._isLazyMode && this._resetIfTotalCountChange),
                takeUntil(
                    merge(
                        this.inputControl.valueChanges.pipe(
                            distinctUntilChanged(),
                        ),
                        this._destroyed$,
                    ),
                ),
                finalize(
                    () => this._isLazyMode ?
                        resetUnloadedState(this._items, 0, this._items.length) :
                        resetUnloadedState(this._items, mappedStart, mappedEnd),
                ),
            )
            .subscribe(({ data = [] }) => {
                if (data.length === 0) {
                    this._removeUnresolvedElements();
                } else {
                    this._items = setLoadedState(
                        data,
                        mappedStart,
                        this._items,
                        this._isLazyMode,
                    );

                    if (this._shouldAddLoadingElementInLazyMode(data)) {
                        this._addLoadingElementInLazyMode();
                    }

                    if (this._shouldLoadMoreOnUpDirection()) {
                        this._loadMore();
                    }
                }

                this.sourceUpdated.emit(this.items);
                this._cd.detectChanges();
            });
    };

    private _resetIfTotalCountChange = ({ total }: ISuggestValues<any>) => {
        const totalCountHasChanged = this._items.length > 0 && total !== this._items.length;
        if (!totalCountHasChanged) {
            return;
        }
        this._items = generateLoadingInitialCollection(this.intl.loadingLabel, total);
        if (total) {
            this._triggerViewportRefresh$.next(null);
        }
    };

    private _gotoBottomAsync(element: HTMLElement) {
        setTimeout(() => element.scrollTop = element.scrollHeight - element.clientHeight, 0);
    }

    private _focusChipInput() {
        // direct focus needed as chip component doesn't expose a focus to input mechanism
        (this._elementRef.nativeElement as HTMLElement).querySelector<HTMLInputElement>(MAT_CHIP_INPUT_SELECTOR)?.focus();
    }

    private _checkUnsuportedScenarios() {
        const UNSUPPORTED_SCENARIOS = [
            {
                errorText: 'enableCustomValue and headerItems are mutually exclusive options',
                scenario: !!this.headerItems!.length && this.enableCustomValue,
            },
            {
                errorText: 'enableCustomValue should not be used with minChars',
                scenario: this.enableCustomValue && this.minChars > 0,
            },
            {
                errorText: 'direction up is not supported when used in conjunction with headerItems',
                scenario: !!this.headerItems!.length && this.direction === 'up',
            },
        ];

        UNSUPPORTED_SCENARIOS.forEach(({ errorText, scenario }) => {
            if (scenario) { throw new Error(errorText); }
        });
    }

    private _getValueSummary(fromTooltip = false) {
        return (this.displayValueFactory ?? this._defaultDisplayValueFactory)(this.value, fromTooltip);
    }

    private _defaultDisplayValueFactory = (value?: ISuggestValue[], fromTooltip = false) =>
        (value ?? []).map(v => this.intl.translateLabel((fromTooltip && v.tooltip) || v.text)).join(', ');

    private _cantNavigate(increment: number) {
        return (!this.items.length &&
            !this.enableCustomValue) ||
            (this._isLazyMode &&
                this._items[this.activeIndex] &&
                this._items[this.activeIndex]?.loading !== VirtualScrollItemStatus.loaded &&
                increment > 0
            );
    }

    private get _isLazyMode() {
        return this.searchSourceStrategy === 'lazy';
    }

    private _removeUnresolvedElements() {
        this._items = this._items
            .filter(({ loading }) => loading === VirtualScrollItemStatus.loaded);

    }

    private _shouldAddLoadingElementInLazyMode(currentResponse: ISuggestValue[]) {
                return this._isLazyMode && currentResponse.length >= this.displayCount;
    }

    private _addLoadingElementInLazyMode() {
        const totalLoadingElements = Math.floor(this.displayCount / 2);
        const loadingElements = generateLoadingInitialCollection(this.intl.loadingLabel, totalLoadingElements);

        if (this.isDown) {
            this._items.push(...loadingElements);
        } else {
            this._items.unshift(...loadingElements);
        }

    }

    private _shouldLoadMoreOnUpDirection() {
        const isUp = !this.isDown;
        const areMoreItemsThankVSKnows = this._virtualScroller?.getDataLength() !== this._items.length;
        const isVSAtTop = (this._virtualScroller?.measureScrollOffset() ?? 0) < this.itemSize * 10;

        return this._isLazyMode && isUp && areMoreItemsThankVSKnows && isVSAtTop;
    }

    private _loadMore() {
        this.rangeLoad({
            start: this._items.length - 1,
            end: this._items.length - 1,
        });
    }

    private _announceSelectStatus(text: string, status: boolean) {
        if (text) {
            this._liveAnnouncer.announce(this.intl.currentItemSelectionStatus(text, status));
        }
    }

    private _isCheckbox(elem?: EventTarget | null) {
        return elem instanceof HTMLInputElement && elem.type === 'checkbox';
    }
}

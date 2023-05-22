import cloneDeep from 'lodash-es/cloneDeep';
import isEqual from 'lodash-es/isEqual';
import {
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
    retry,
    startWith,
    switchMap,
    takeUntil,
    tap,
} from 'rxjs/operators';

import { LiveAnnouncer } from '@angular/cdk/a11y';
import { ListRange } from '@angular/cdk/collections';
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
export const MAT_CHIP_INPUT_SELECTOR = '.mat-chip-list input';

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
    animations: [
        UI_SUGGEST_ANIMATIONS.transformMenuList,
    ],
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
     * By default the onOpen fetchStrategy prevents additional requests if closed.
     * This allows you to bypass that check and update even if closed.
     */
    @Input()
    ignoreOpenOnFetch = false;

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
     * Configure the direction in which to open the overlay: `up` or `down`.
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
            return this._getValueSummary();
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

        const actualCount = Math.max(
            this.renderItems.filter(Boolean).length + (this.enableCustomValue ?
                (Number(this.isCustomValueVisible)) : (this.headerItems!.length)),
            1,
        );
        const displayedCount = Math.min(this.displayCount, actualCount);

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

    /**
     * A search stream factory, generally used to retrieve data from the server when a user searches.
     * By `default`, a search factory is generated that does an `in-memory` lookup if `searchable` is set to `true`.
     *
     */
    @Input()
    searchSourceFactory?: (searchTerm?: string, fetchCount?: number, skip?: number) => Observable<ISuggestValues<any>>;
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
    width = '150px';
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
    displayCount = 10;
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
     * Emits when the overlay is displayed (dropdown open).
     *
     */
    @Output()
    opened = new EventEmitter<void>();

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

    @ViewChild(CdkVirtualScrollViewport)
    protected set _virtualScrollerQuery(value: CdkVirtualScrollViewport) {
        if (this._virtualScroller === value) { return; }

        this._virtualScroller = value;

        this._virtualScroller!
            .scrolledIndexChange
            .pipe(
                takeUntil(this._destroyed$),
            )
            .subscribe(start => this._visibleRange = {
                start,
                end: start + this.displayCount,
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

    private _inputChange$: Observable<string>;
    private _drillDown = false;

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
    ) {
        super(
            elementRef,
            errorStateMatcher,
            parentForm,
            parentFormGroup,
            cd,
            ngControl,
        );

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
            this._disabled$.pipe(filter(v => !v)),
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
            map(([value]) => value),
        );

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
        if (this.alwaysExpanded) {
            this.open();
        }

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
                filter(_ => this.isOpen),
                takeUntil(this._destroyed$),
            )
            .subscribe(this._virtualScrollTo);
    }

    ngOnChanges(changes: SimpleChanges) {
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
    onBlur() {
        this._focusChanged(this.isOpen);
    }

    /**
     * Notifies focus changes to the `form`.
     *
     * @ignore
     */
    onFocus() {
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
    }

    /**
     * Closes the dropdown.
     *
     * @param [refocus=true] If the dropdown should be focused after closing.
     */
    close(refocus = true) {
        if (this.alwaysExpanded || !this.isOpen) { return; }

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
            !this.items.length &&
            !this.enableCustomValue
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
        if (value.loading !== VirtualScrollItemStatus.loaded) { return; }

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
            } else if (!this.compact) {
                this.inputControl.setValue('');
                this._focusChipInput();
            }
            this._pushEntry(value);

            this._announceSelectStatus(value.text, true);
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
        if (!ev) { return; }
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

        this._searchSub = this.searchSourceFactory(searchValue, this.displayCount)
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
            this.isDown);

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

        const fetchCount = end - start + 1;
        const mappedStart = this.isDown ? start : this._items.length - end - 1;
        const mappedEnd = this.isDown ? end : this._items.length - start - 1;

        setPendingState(this._items, mappedStart, mappedEnd);

        this.searchSourceFactory(this.inputControl.value.trim(), fetchCount, start)
            .pipe(
                retry(1),
                map(res => this.isDown ? res : {
                    data: (res.data ?? []).reverse(),
                    total: res.total,
                }),
                tap(this._resetIfTotalCountChange),
                takeUntil(
                    merge(
                        this.inputControl.valueChanges.pipe(
                            distinctUntilChanged(),
                        ),
                        this._destroyed$,
                    ),
                ),
                finalize(
                    () => resetUnloadedState(this._items, mappedStart, mappedEnd),
                ),
            )
            .subscribe(({ data = [] }) => {
                this._items = setLoadedState(
                    data,
                    mappedStart,
                    this._items,
                );
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
        document.querySelector<HTMLInputElement>(MAT_CHIP_INPUT_SELECTOR)?.focus();
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

    private _getValueSummary() {
        return this.value.map(v => this.intl.translateLabel(v.text)).join(', ');
    }

    private _announceSelectStatus(text: string, status: boolean) {
        if (text) {
            this._liveAnnouncer.announce(this.intl.currentItemSelectionStatus(text, status));
        }
    }
}

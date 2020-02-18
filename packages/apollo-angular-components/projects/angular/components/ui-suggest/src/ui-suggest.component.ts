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

    /**
     * Configure if the component is `disabled`.
     *
     */
    @HostBinding('class.disabled')
    @Input()
    public get disabled() {
        return this._disabled$.value;
    }
    public set disabled(value) {
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
     * If true, the item list will render open and will not close on selection
     *
     * @ignore
     */
    @Input()
    public alwaysExpanded = false;

    /**
     * Configure if the component allows multi-selection.
     *
     */
    @Input()
    public get multiple() {
        return this._multiple;
    }
    public set multiple(multiple) {
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
    public get items() {
        return this._items;
    }
    public set items(items: ISuggestValue[]) {

        if (!items || isEqual(items, this._items)) { return; }

        this._lastSetItems = cloneDeep(items);

        if (this.searchable) {
            this.fetch(this.inputControl.value);
        }

        this._items = this._sortItems(items)
            .map(r => ({ ...r, loading: VirtualScrollItemStatus.loaded }));
    }

    /**
     * Configure the direction in which to open the overlay: `up` or `down`.
     *
     */
    @Input()
    public set direction(value: SuggestDirection) {
        if (this._direction === value) { return; }
        this._items.reverse();
        this._direction = value;
    }
    public get direction() {
        return this._direction;
    }

    /**
     * Configure if the dropdown has `search` enabled.
     *
     */
    @Input()
    public get searchable() {
        return !!this.searchSourceFactory;
    }
    public set searchable(searchable) {
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
    public itemTemplate: TemplateRef<any> | null = null;

    /**
     * Computes the current tooltip value.
     *
     */
    public get tooltip() {
        if (
            !this.isOpen &&
            this._hasValue
        ) {
            return this.value.map(v => this.intl.translateLabel(v.text)).join(', ');
        }

        return null;
    }

    /**
     * Determines if the `custom value` option should be `displayed`.
     *
     */
    public get isCustomValueVisible(): boolean {
        return this._hasCustomValue$.value && !this.loading$.value;
    }

    /**
     * Retrieves the currently `rendered` items.
     *
     */
    public get renderItems() {
        return this.loading$.value ? [] :
            this._hasCustomValue$.value &&
                !this.isDown ?
                [...this.items, false] :
                this.items;
    }

    /**
     * Configure if the user is allowed to select `custom values`.
     *
     * TODO:
     *  Currently custom values can be selected if the component is used in `single` selection mode.
     *  Add support for multiple selection
     */
    @Input()
    public get enableCustomValue() {
        return this._enableCustomValue &&
            !this._multiple;
    }
    public set enableCustomValue(value) {
        this._enableCustomValue = !!value;
    }

    /**
     * Configure if the dropdown is in a `loading` state.
     *
     */
    @Input()
    public set loading(value: boolean) {
        this.loading$.next(value);
    }

    /**
     * Determines if there are no results to display.
     *
     */
    public get hasNoResults() {
        return !this.loading$.value && !this.items.length;
    }

    /**
     * Computes the `viewport` max-height.
     *
     */
    public get viewportMaxHeight() {
        if (!this.isOpen) { return 0; }

        const actualCount = Math.max(this.renderItems.filter(Boolean).length + Number(this.isCustomValueVisible), 1);
        const displayedCount = Math.min(this.displayCount, actualCount);

        return this.itemSize * displayedCount;
    }

    private get _isOnCustomValueIndex() {
        return this.enableCustomValue &&
            !!this.inputControl.value &&
            (
                this.activeIndex === -1 ||
                this.activeIndex === this._items.length
            );
    }

    private get _itemLowerBound() {
        return this._hasCustomValue$.value && this.isDown ? -1 : 0;
    }

    private get _itemUpperBound() {
        return this.items.length + (this._hasCustomValue$.value && !this.isDown ? 0 : -1);
    }

    /**
     * A search stream factory, generally used to retrieve data from the server when a user searches.
     * By `default`, a search factory is generated that does an `in-memory` lookup if `searchable` is set to `true`.
     *
     */
    @Input()
    public searchSourceFactory?: (searchTerm?: string, fetchCount?: number, skip?: number) => Observable<ISuggestValues<any>>;
    @Input()
    public customValueLabelTranslator!: (value: string) => string;

    /**
     * Configure the `fetchStrategy` for requesting data using searchSourceFactory
     * `eager` - makes calls to searchSourceFactory onInit
     * `onOpen` - makes calls to searchSourceFactory onOpen
     */
    @Input()
    public set fetchStrategy(strategy: 'eager' | 'onOpen') {
        if (strategy === this._fetchStrategy$.value) { return; }

        this._fetchStrategy$.next(strategy);
    }
    /**
     * Configure the `control` width.
     *
     */
    @Input()
    public width = '150px';
    /**
     * Configure the `maximum` search length.
     *
     */
    @Input()
    public maxLength?: number;
    /**
     * The search event debounce interval in `ms`.
     *
     */
    @Input()
    public debounceTime = DEFAULT_SUGGEST_DEBOUNCE_TIME;
    /**
     * The maximum number of items rendered in the viewport.
     *
     */
    @Input()
    public displayCount = 10;
    /**
     * Configure if the component allows selection clearing.
     *
     */
    @Input()
    public clearable = true;
    /**
     * Configure the `default` selected value.
     *
     */
    @Input()
    public defaultValue = '';
    /**
     * Configure if the tooltip should be disabled.
     *
     */
    @Input()
    public disableTooltip = false;

    /**
     * Emits `once` when `data` is retrieved for the `first time`.
     *
     */
    @Output()
    public sourceInitialized = new EventEmitter<ISuggestValue[]>();

    /**
     * Emits `every` time item data is retrieved.
     *
     */
    @Output()
    public sourceUpdated = new EventEmitter<ISuggestValue[]>();

    /**
     * Emits when the overlay is hidden (dropdown close).
     *
     */
    @Output()
    public closed = new EventEmitter<void>();

    /**
     * Emits when the overlay is displayed (dropdown open).
     *
     */
    @Output()
    public opened = new EventEmitter<void>();

    /**
     * @ignore
     */
    public VirtualScrollItemStatus = VirtualScrollItemStatus;
    /**
     * Configures the dropdown open state.
     *
     * @ignore
     */
    public set isOpen(isOpen: boolean) {
        if (this._isOpen$.value === isOpen) { return; }

        this._isOpen$.next(isOpen);
    }
    public get isOpen() {
        return this._isOpen$.value;
    }
    /**
     * The current selected item index.
     *
     * @ignore
     */
    public activeIndex = -1;
    /**
     * The component loading state source.
     *
     * @ignore
     */
    public loading$ = new BehaviorSubject(false);
    /**
     * Stream that triggers focusing.
     *
     * @ignore
     */
    public focus$ = new Subject<boolean>();

    @ViewChild(CdkVirtualScrollViewport)
    protected set _virtualScrollerQuery(value: CdkVirtualScrollViewport) {
        if (this._virtualScroller === value) { return; }

        this._virtualScroller = value;

        this._virtualScroller!
            .scrolledIndexChange
            .pipe(
                takeUntil(this._destroyed$),
            )
            .subscribe(start => this._visibleRange = { start, end: start + this.displayCount });
    }

    private _hasCustomValue$ = new BehaviorSubject(false);
    private _reset$ = new Subject();

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

    private _triggerViewportRefresh$ = new BehaviorSubject<null>(null);
    private _destroyed$ = new Subject();
    private _scrollTo$ = new Subject<number>();
    private _rangeLoad$ = new Subject<ListRange>();
    private _fetchStrategy$ = new BehaviorSubject<'eager' | 'onOpen'>('eager');
    private _isOpen$ = new BehaviorSubject(false);

    private _virtualScroller?: CdkVirtualScrollViewport;
    private _visibleRange = { start: Number.NEGATIVE_INFINITY, end: Number.POSITIVE_INFINITY };

    private _inputChange$: Observable<string>;

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
                tap(this._setLoadingState),
                debounceTime(this.debounceTime),
                filter(_ => !!this.searchSourceFactory),
            ),
            this._disabled$.pipe(filter(v => !v)),
            this._fetchStrategy$
                .pipe(
                    switchMap(strategy =>
                        strategy === 'eager'
                            ? of(strategy)
                            : this._isOpen$.pipe(filter(o => !!o)),
                    ),
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
     * @ignore
     */
    ngOnInit() {
        if (this.alwaysExpanded) {
            this.open();
        }

        merge(
            this._reset$.pipe(
                map(_ => ''),
                tap(_ => !!this.inputControl.value && this.inputControl.setValue('')),
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
     * Is called every time a new range needs to be loaded.
     *
     * @ignore
     */
    public rangeLoad = (range: ListRange) => this._rangeLoad$.next(range);

    /**
     * Disable state hook for the `form`.
     *
     * @param isDisabled The truth of of the `disabled` state.
     * @ignore
     */
    public setDisabledState(isDisabled: boolean) {
        this.disabled = isDisabled;
    }

    /**
     * Handles `click` events on the `form-control` container.
     *
     * @ignore
     */
    public onContainerClick(event: MouseEvent) {
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
    public onBlur() {
        this._focusChanged(this.isOpen);
    }

    /**
     * Notifies focus changes to the `form`.
     *
     * @ignore
     */
    public onFocus() {
        this._focusChanged(true);
    }

    /**
     * Toggle the dropdown state (opened/closed);
     *
     */
    public toggle() {
        this.isOpen ? this.close() : this.open();
    }

    /**
     * Opens the dropdown.
     *
     */
    public open() {
        if (this._isOpenDisabled) { return; }

        this.isOpen = true;
        this.opened.emit();
        this._focusChanged(true);

        const [value] = this.value;

        if (
            this.enableCustomValue &&
            value &&
            value.isCustom
        ) {
            this.inputControl.setValue(value.text);
        }

        const hasSingleSelectValue = !!value && !this.multiple;

        this._setActiveIndex(
            hasSingleSelectValue ?
                this._items.findIndex(({ id }) => id === value.id) :
                -1,
        );

        this._scrollTo$.next(this.activeIndex);
    }

    /**
     * Closes the dropdown.
     *
     * @param [refocus=true] If the dropdown should be focused after closing.
     */
    public close(refocus = true) {
        if (this.alwaysExpanded || !this.isOpen) { return; }

        if (this._isOnCustomValueIndex && !this.loading$.value) {
            if (!this.multiple) {
                this._clearSelection();
            }
            this._pushEntry(toSuggestValue(this.inputControl.value, true));
        }

        this.registerTouch();
        this.clear();

        this.isOpen = false;
        this.activeIndex = -1;
        this._visibleRange = { start: Number.NEGATIVE_INFINITY, end: Number.POSITIVE_INFINITY };
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
    public reset() {
        this._reset$.next();
    }

    /**
     * Removes the active dropdown selection.
     *
     * @param [ev] `Mouse` or `Keyboard`.
     */
    public removeSelection(ev?: KeyboardEvent | MouseEvent) {
        if (!this.clearable) { return; }

        this.preventDefault(ev);

        this._clearSelection();
        this.selected.emit();
        this.registerChange(this.value);

        this.close(false);
    }

    /**
     * Navigates through the items by looking up the next focused / active index.
     *
     * @param increment The increment that should be applied to the current index.
     * @param [ev] The navigation trigger event.
     * @ignore
     */
    public navigate(increment: number, ev?: Event) {
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
            this.activeIndex = this._items.findIndex(v => v.id === value.id);
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
    public setSelectedItem() {
        if (this.loading$.value) { return; }

        if (this._isOnCustomValueIndex) {
            return this.updateValue(this.inputControl.value);
        }

        this._selectActiveItem(!this.multiple);
    }

    /**
     * Determines if the provided `item` is currently selected.
     *
     * @param [item] The `item` that needs to be checked.
     * @returns If the provided `item` is selected.
     */
    public isItemSelected(item?: ISuggestValue) {
        return !!item &&
            !!this.value.find(v => v.id === item.id);
    }

    /**
     * Updates the component value.
     *
     * @param inputValue The value that needs to be selected.
     * @param [closeAfterSelect=true] If the dropdown should close after the value is selected.
     * @param [refocus=true] If the search input should regain focus after selection.
     */
    public updateValue(inputValue: ISuggestValue | string, closeAfterSelect = true, refocus = true) {
        const value = toSuggestValue(inputValue, this._isOnCustomValueIndex);
        if (value.loading !== VirtualScrollItemStatus.loaded) { return; }

        const isItemSelected = this.isItemSelected(value);

        if (!isItemSelected && value) {
            if (!this.multiple) {
                this._clearSelection();
            }
            this._pushEntry(value);
        }

        if (
            this.multiple &&
            isItemSelected &&
            !!value
        ) {
            this._removeEntry(value);
        }

        if (closeAfterSelect) {
            this.close(refocus);
        }
    }

    /**
     * @ignore
     */
    public preventDefault(ev?: Event) {
        if (!ev) { return; }
        ev.preventDefault();
        ev.stopImmediatePropagation();
    }

    /**
     * Triggers a refetch of data, calling the `searchSourceFactory` with the provided search term.
     *
     * @param searchValue The search value that should be used for the `fetch`.
     */
    public fetch = (searchValue = '') => {
        if (!this.searchSourceFactory) { return; }

        this.loading$.next(true);

        if (this._searchSub) { this._searchSub.unsubscribe(); }

        this._searchSub = this.searchSourceFactory(searchValue, this.displayCount)
            .pipe(
                tap(this._setInitialItems),
                map(this._findItemIndex(searchValue)),
                tap(this._checkCustomValue(searchValue)),
                tap(this._setActiveIndex),
                takeUntil(this._destroyed$),
            ).subscribe(_ => {
                this.loading$.next(false);
                this._scrollToFirst();
                this._cd.detectChanges();
            }, (error) => {
                if (isDevMode()) {
                    console.warn('UiSuggest fetch failed, more info: ', error);
                }

                this.loading$.next(false);
                this._items = [];
            });
    }

    /**
     * `NgFor` track method.
     *
     * @ignore
     */
    public trackById = (_: number, { id }: ISuggestValue) => id;

    private _selectActiveItem(closeAfterSelect: boolean) {
        const item = this.items[this.activeIndex];
        if (!item) { return; }

        this.updateValue(item, closeAfterSelect);
        this._scrollTo$.next(this.activeIndex);
    }

    private _findItemIndex = (searchValue: string) =>
        () => this._items.findIndex(({ text }) => caseInsensitiveCompare(text, searchValue))

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
            this._setHasCustomValue(!!searchValue && itemIndex === -1);
    }

    private _setHasCustomValue(isCustomValue: boolean) {
        if (this._hasCustomValue$.value === isCustomValue) { return; }
        this._hasCustomValue$.next(isCustomValue);
    }

    private _virtualScrollTo = (index: number) => {
        const vs = this._virtualScroller;
        const customValueOffset = this._itemLowerBound;

        if (!vs ||
            (this.isDown
                ? index !== 0
                : index !== this._items.length - 1) &&
            index >= this._visibleRange.start + customValueOffset &&
            index < this._visibleRange.end + customValueOffset
        ) {
            return;
        }

        const passedBottomBound = index === this._visibleRange.end + customValueOffset;
        const passedTopBound = index < this._visibleRange.start + customValueOffset;

        const start = passedBottomBound
            ? index + 1 - customValueOffset - this.displayCount
            : Math.max(Math.min(index, this.items.length - this.displayCount), 0);

        const end = start + this.displayCount;

        this._visibleRange = { start, end };

        vs.setRenderedRange({
            start,
            end,
        });
        vs.setRenderedContentOffset(start * this.itemSize);

        if (
            end > this._itemUpperBound
            && this.isCustomValueVisible
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
    }

    private _announceNavigate() {
        const textToAnnounce = !this._isOnCustomValueIndex ?
            this.items[this.activeIndex].text :
            `${this.intl.customValueLiveLabel} ${this.customValueLabelTranslator(this.inputControl.value)}`;
        this._liveAnnouncer.announce(this.intl.currentItemLabel(textToAnnounce, this.activeIndex + 1, this._items.length));
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
    }

    private _setActiveIndex = (itemIndex: number) => {
        this.activeIndex = itemIndex > -1 ?
            itemIndex :
            this.isDown ?
                this._itemLowerBound
                : this._itemUpperBound;
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
        this._setActiveIndex(this._items.indexOf(entry));

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
        this.searchSourceFactory(this.inputControl.value, fetchCount, start)
            .pipe(
                retry(1),
                map(res => this.isDown ? res : {
                    data: (res.data || []).reverse(),
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
    }

    private _resetIfTotalCountChange = ({ total }: ISuggestValues<any>) => {
        const totalCountHasChanged = this._items.length > 0 && total !== this._items.length;
        if (!totalCountHasChanged) {
            return;
        }
        this._items = generateLoadingInitialCollection(this.intl.loadingLabel, total);
        if (!!total) {
            this._triggerViewportRefresh$.next(null);
        }
    }

    private _gotoBottomAsync(element: HTMLElement) {
        setTimeout(() => element.scrollTop = element.scrollHeight - element.clientHeight, 0);
    }
}

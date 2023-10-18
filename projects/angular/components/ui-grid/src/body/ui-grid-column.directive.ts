import { Subject } from 'rxjs';

import {
    ContentChild,
    Directive,
    Input,
    isDevMode,
    OnChanges,
    OnDestroy,
    SimpleChange,
    SimpleChanges,
    TemplateRef,
} from '@angular/core';
import { SortDirection } from '@angular/material/sort';
import { identifier } from '@uipath/angular/utilities';

import { UiGridDropdownFilterDirective } from '../filters/ui-grid-dropdown-filter.directive';
import { UiGridSearchFilterDirective } from '../filters/ui-grid-search-filter.directive';

/**
 * @ignore
 */
const ARIA_SORT_MAP: Record<SortDirection, string> = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '': 'none',
    asc: 'ascending',
    desc: 'descending',
};

const STICKY_MIN_WIDTH_FRACTION = 0.25;

/**
 * @ignore
 */
const REACTIVE_INPUT_LIST: (keyof UiGridColumnDirective<Record<string, unknown>>)[]
    = ['sort', 'visible', 'title', 'primary'];

/**
 * The grid column definition directive.
 *
 * @export
 */
@Directive({
    selector: '[uiGridColumn], ui-grid-column',
})
export class UiGridColumnDirective<T> implements OnChanges, OnDestroy {
    /**
     * Set the column width, in `%`.
     *
     */
    @Input()
    set width(value: number | string) {
        if (
            isDevMode() &&
            typeof value === 'string' &&
            !value.endsWith('%')
        ) {
            console.error(`Width should be percentual for '${this.title}' column.`);
        }

        const width = typeof value === 'string' ? Number(parseFloat(value).toFixed(1)) : value;

        if (isNaN(width)) { return; }

        this._width = width * 10;

        if (this.isSticky && !this._alreadySetMinWidth) {
            this._alreadySetMinWidth = true;
            this.minWidth = this._width * STICKY_MIN_WIDTH_FRACTION;
        }
    }

    /**
     * Returns the column width, in `%`.
     *
     */
    get width() {
        return this._width;
    }

    /**
     * Returns the `aria-sort` associated to the current sort.
     *
     */
    get ariaSort() {
        return ARIA_SORT_MAP[this.sort];
    }

    /**
     * The string identifier for the column.
     *
     * (used for resize identification)
     *
     */
    identifier = identifier();

    /**
     * Configure if the column is sortable.
     *
     */
    @Input()
    sortable = false;

    /**
     * Configure if the column should be included in the search.
     *
     */
    @Input()
    searchable = false;

    /**
     * Configure if the column is resizeable or not.
     *
     */
    @Input()
    resizeable = true;

    /**
     * The column title.
     *
     */
    @Input()
    title?: string;

    /**
     * The property that should be loaded in the associated row cell.
     *
     */
    @Input()
    property?: keyof T | string; // nested property

    /**
     * If defined, this will be used for sorting and filtering
     *
     */
    @Input()
    queryProperty?: keyof T | string; // nested property

    /**
     * The method metadata used for searches.
     *
     */
    @Input()
    method?: string;

    /**
     * The current sort of the column.
     *
     */
    @Input()
    sort: SortDirection = '';

    /**
     * If true and ui-grid has scrollable resize strategy, then the column will be placed in sticky mode
     *
     */
    @Input()
    set isSticky(value: boolean) {
        this._isSticky = value;
        this.disableToggle = this.disableToggle || value;
        if (value) {
            this.visible = true;
            this._alreadySetMinWidth = true;
            this.minWidth = this._width * STICKY_MIN_WIDTH_FRACTION;
        }
    }
    get isSticky() {
        return this._isSticky;
    }

    /**
     * If the column should be styled as primary.
     *
     */
    @Input()
    get primary() {
        return this._primary;
    }
    set primary(primary: boolean) {
        if (primary === this._primary) { return; }
        this._primary = !!primary;

        this.change$.next({
            primary: new SimpleChange(!primary, primary, false),
        });
    }

    /**
     * If the column can have visibility toggled.
     *
     */
    @Input()
    set disableToggle(value: boolean) {
        this._disableToggle = value;
    }
    get disableToggle() {
        return this._disableToggle;
    }

    /**
     * If the column should be rendered, used as default state if toggle columns is turned on.
     *
     */
    @Input()
    get visible() {
        return this._visible;
    }
    set visible(visible: boolean) {
        if (visible === this._visible) { return; }
        this._visible = !!visible;

        this.change$.next({
            visible: new SimpleChange(!visible, visible, false),
        });
    }

    /**
     * The minimum width percentage that the column should have when resizing.
     *
     */
    @Input()
    minWidth = 30;

    /**
     * If the searchable dropdown associated to the column should trigger a data fetch when opened.
     *
     */
    @Input()
    refetch = false;

    @Input()
    description = '';

    /**
     * The searchable dropdown directive reference.
     *
     * @ignore
     */
    @ContentChild(UiGridSearchFilterDirective, {
        static: true,
    })
    searchableDropdown?: UiGridSearchFilterDirective<T>;

    /**
     * The dropdown directive reference.
     *
     * @ignore
     */
    @ContentChild(UiGridDropdownFilterDirective, {
        static: true,
    })
    dropdown?: UiGridDropdownFilterDirective<T>;

    /**
     * The view template associated to the row cell.
     *
     * @ignore
     */
    @ContentChild(TemplateRef, {
        static: true,
    })
    html?: TemplateRef<any>;

    /**
     * Emits when reactive properties change.
     *
     */
    change$ = new Subject<SimpleChanges>();

    private _width = NaN;
    private _visible = true;
    private _primary = false;
    private _isSticky = false;
    private _disableToggle = false;
    private _alreadySetMinWidth = false;
    /**
     * @ignore
     */
    ngOnChanges(changes: SimpleChanges) {
        const isAnyPropertyChanged = Object.keys(changes)
            .filter(property => REACTIVE_INPUT_LIST.includes(property as keyof UiGridColumnDirective<T>))
            .map(property => changes[property])
            .some(change => !change.firstChange &&
                change.currentValue !== change.previousValue,
            );

        if (!isAnyPropertyChanged) { return; }

        this.change$.next(changes);
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.change$.complete();
    }
}

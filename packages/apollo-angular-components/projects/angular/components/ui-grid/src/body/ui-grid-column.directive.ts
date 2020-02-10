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

import { Subject } from 'rxjs';

import { UiGridDropdownFilterDirective } from '../filters/ui-grid-dropdown-filter.directive';
import { UiGridSearchFilterDirective } from '../filters/ui-grid-search-filter.directive';

/**
 * @ignore
 */
const ARIA_SORT_MAP: Record<SortDirection, string> = {
    '': 'none',
    'asc': 'ascending',
    'desc': 'descending',
};

/**
 * @ignore
 */
const REACTIVE_INPUT_LIST: (keyof UiGridColumnDirective<{}>)[]
    = ['sort', 'visible', 'title'];

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
    public set width(value: number | string) {
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
    }

    /**
     * Returns the column width, in `%`.
     *
     */
    public get width() {
        return this._width;
    }

    /**
     * Returns the `aria-sort` associated to the current sort.
     *
     */
    public get ariaSort() {
        return ARIA_SORT_MAP[this.sort];
    }

    /**
     * The string identifier for the column.
     *
     * (used for resize identification)
     *
     */
    public identifier = identifier();

    /**
     * Configure if the column is sortable.
     *
     */
    @Input()
    public sortable = false;

    /**
     * Configure if the column should be included in the search.
     *
     */
    @Input()
    public searchable = false;

    /**
     * Configure if the column is resizeable or not.
     *
     */
    @Input()
    public resizeable = true;

    /**
     * The column title.
     *
     */
    @Input()
    public title?: string;

    /**
     * The property that should be loaded in the associated row cell.
     *
     */
    @Input()
    public property?: keyof T | string; // nested property

    /**
     * The method metadata used for searches.
     *
     */
    @Input()
    public method?: string;

    /**
     * The current sort of the column.
     *
     */
    @Input()
    public sort: SortDirection = '';

    /**
     * If the column should be styled as primary.
     *
     */
    @Input()
    public primary = false;

    /**
     * If the column can have visibility toggled.
     *
     */
    @Input()
    public disableToggle = false;

    /**
     * If the column should be rendered, used as default state if toggle columns is turned on.
     *
     */
    @Input()
    public get visible() {
        return this._visible;
    }
    public set visible(visible: boolean) {
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
    public minWidth = 30;

    /**
     * If the searchable dropdown associated to the column should trigger a data fetch when opened.
     *
     */
    @Input()
    public refetch = false;

    /**
     * The searchable dropdown directive reference.
     * @ignore
     */
    @ContentChild(UiGridSearchFilterDirective, {
        static: true,
    })
    public searchableDropdown?: UiGridSearchFilterDirective<T>;

    /**
     * The dropdown directive reference.
     * @ignore
     */
    @ContentChild(UiGridDropdownFilterDirective, {
        static: true,
    })
    public dropdown?: UiGridDropdownFilterDirective<T>;

    /**
     * The view template associated to the row cell.
     * @ignore
     */
    @ContentChild(TemplateRef, {
        static: true,
    })
    public html?: TemplateRef<any>;

    /**
     * Emits when reactive properties change.
     *
     */
    public change$ = new Subject<SimpleChanges>();

    private _width = NaN;
    private _visible = true;

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

import {
  ContentChild,
  Directive,
  Input,
  isDevMode,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  TemplateRef,
} from '@angular/core';
import { SortDirection } from '@angular/material/sort';
import { identifier } from '@uipath/angular/utilities';

import { Subject } from 'rxjs';

import {
  UiGridDropdownFilterDirective,
  UiGridSearchFilterDirective,
} from '../filters';

const ARIA_SORT_MAP: Record<SortDirection, string> = {
    '': 'none',
    'asc': 'ascending',
    'desc': 'descending',
};

const REACTIVE_INPUT_LIST: (keyof UiGridColumnDirective<{}>)[]
    = ['sort', 'visible'];

@Directive({
    selector: '[uiGridColumn], ui-grid-column',
})
export class UiGridColumnDirective<T> implements OnChanges, OnDestroy {
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

    public get width() {
        return this._width;
    }

    public get ariaSort() {
        return ARIA_SORT_MAP[this.sort];
    }

    public identifier = identifier();

    @Input()
    public sortable = false;

    @Input()
    public searchable = false;

    @Input()
    public resizeable = true;

    @Input()
    public title?: string;

    @Input()
    public property?: keyof T | string; // nested property

    @Input()
    public method?: string;

    @Input()
    public sort: SortDirection = '';

    @Input()
    public primary = false;

    @Input()
    public visible = true;

    @Input()
    public minWidth = 30;

    @Input()
    public refetch = false;

    @ContentChild(UiGridSearchFilterDirective)
    public searchableDropdown?: UiGridSearchFilterDirective<T>;

    @ContentChild(UiGridDropdownFilterDirective)
    public dropdown?: UiGridDropdownFilterDirective<T>;

    @ContentChild(TemplateRef)
    public html?: TemplateRef<any>;

    public change$ = new Subject<SimpleChanges>();

    private _width = NaN;

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

    ngOnDestroy() {
        this.change$.complete();
    }
}

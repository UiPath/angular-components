import isEqual from 'lodash-es/isEqual';
import {
    BehaviorSubject,
    combineLatest,
} from 'rxjs';
import {
    distinctUntilChanged,
    map,
} from 'rxjs/operators';

import { ISuggestValue } from '@uipath/angular/components/ui-suggest';

import { UiGridColumnDirective } from '../body/ui-grid-column.directive';
import {
    IDropdownOption,
    UiGridDropdownFilterDirective,
} from '../filters/ui-grid-dropdown-filter.directive';
import {
    UiGridSearchFilterDirective,
} from '../filters/ui-grid-search-filter.directive';
import { UiGridHeaderDirective } from '../header/ui-grid-header.directive';
import { IFilterModel } from '../models';

/**
 * Handles and aggregates all filters with the latest values.
 *
 * @export
 * @ignore
 * @internal
 */
export class FilterManager<T> {
    public filter$ = new BehaviorSubject<IFilterModel<T>[]>([]);

    public dirty$ = this.filter$.pipe(
        map(filters =>
            !!this._initialFilters
            && !isEqual(
                this._sortByProperty(filters),
                this._sortByProperty(this._initialFilters),
            ),
        ),
        distinctUntilChanged(),
    );

    public activeCount$ = combineLatest([
        this.filter$,
        this.dirty$,
    ]).pipe(
        map(([filters, dirty]) => {
            if (!dirty) {
                return 0;
            }

            return filters.filter(current =>
                !this._initialFilters?.find(initial => isEqual(initial, current)),
            ).length;
        }),
        distinctUntilChanged(),
    );

    private _initialFilters: IFilterModel<T>[] | null = null;

    constructor(
        private _columns: UiGridColumnDirective<T>[] = [],
    ) { }

    public get columns() {
        return this._columns;
    }

    public set columns(columns: UiGridColumnDirective<T>[]) {
        this._columns = columns;
        this._emitFilterOptions();
    }

    public destroy() {
        this.filter$.complete();
    }

    public searchableDropdownUpdate = (column?: UiGridColumnDirective<T>, value?: ISuggestValue) =>
        this._updateFilterValue(column, value, this._mapSearchableDropdownItem);

    public dropdownUpdate = (column?: UiGridColumnDirective<T>, value?: IDropdownOption) =>
        this._updateFilterValue(column, value, this._mapDropdownItem);

    public searchChange(term: string | undefined, header: UiGridHeaderDirective<T>) {
        const searchFilterCollection: IFilterModel<T>[] = term ?
            this._columns
                .filter(column => column.searchable)
                .map(column => ({
                    property: column.property,
                    value: term,
                    method: column.method,
                })) as IFilterModel<T>[] :
            [];

        header.searchValue = term;
        header.searchTerm.emit(term);
        header.searchFilter.emit(searchFilterCollection);
    }

    private _updateFilterValue = (
        column: UiGridColumnDirective<T> | undefined,
        value: ISuggestValue | IDropdownOption | undefined,
        mapper: (column: UiGridColumnDirective<T>) => IFilterModel<T>,
    ): void => {
        if (!column) { return; }

        const dropdown = column.dropdown || column.searchableDropdown;

        if (!dropdown) { return; }

        (dropdown as {
            updateValue: (value: ISuggestValue | IDropdownOption | undefined) => void;
        }).updateValue(value);
        dropdown.filterChange.emit(value ? mapper(column) : null);

        this._emitFilterOptions();
    };

    private _emitFilterOptions = () => {
        const dropdownFilters = this._columns
            .filter(({ dropdown }) => this._hasFilterValue(dropdown))
            .map(this._mapDropdownItem);

        const searchableFilters = this._columns
            .filter(({ searchableDropdown }) => this._hasFilterValue(searchableDropdown))
            .map(this._mapSearchableDropdownItem);

        const updatedFilters = [...dropdownFilters, ...searchableFilters];

        if (!this._initialFilters) {
            this._initialFilters = updatedFilters;
        }
        if (isEqual(this.filter$.getValue(), updatedFilters)) { return; }

        this.filter$.next(updatedFilters);
    };

    private _hasFilterValue = (dropdown?: UiGridSearchFilterDirective<T> | UiGridDropdownFilterDirective<T>) =>
        !!dropdown &&
        dropdown.value;

    private _mapDropdownItem = (column: UiGridColumnDirective<T>) => ({
        method: column.dropdown!.method,
        property: column.property,
        value: column.dropdown!.value!.value,
    }) as IFilterModel<T>;

    private _mapSearchableDropdownItem = (column: UiGridColumnDirective<T>): IFilterModel<T> => ({
        method: column.searchableDropdown!.method,
        property: column.searchableDropdown!.property || column.property,
        value: column.searchableDropdown!.value!.id,
    }) as IFilterModel<T>;

    private _sortByProperty(filters: IFilterModel<T>[]): any {
        return filters.sort((a, b) => (a.property > b.property) ? 1 : -1);
    }
}

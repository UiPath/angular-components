import { ISuggestValue } from '@uipath/angular/components/ui-suggest';

import isEqual from 'lodash-es/isEqual';
import { BehaviorSubject } from 'rxjs';

import { UiGridColumnDirective } from '../body/ui-grid-column.directive';
import {
    IDropdownOption,
    UiGridDropdownFilterDirective,
} from '../filters/ui-grid-dropdown-filter.directive';
import { UiGridSearchFilterDirective } from '../filters/ui-grid-search-filter.directive';
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
        this._updateFilterValue(column, value, this._mapSearchableDropdownItem)

    public dropdownUpdate = (column?: UiGridColumnDirective<T>, value?: IDropdownOption) =>
        this._updateFilterValue(column, value, this._mapDropdownItem)

    public searchChange(term: string | undefined, header: UiGridHeaderDirective<T>) {
        const searchFilterCollection: IFilterModel<T>[] = !!term ?
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
            updateValue: (value: ISuggestValue | IDropdownOption | undefined) => void,
        }).updateValue(value);
        dropdown.filterChange.emit(value ? mapper(column) : null);

        this._emitFilterOptions();
    }

    private _emitFilterOptions = () => {
        const dropdownFilters = this._columns
            .filter(({ dropdown }) => this._hasFilterValue(dropdown))
            .map(this._mapDropdownItem);

        const searchableFilters = this._columns
            .filter(({ searchableDropdown }) => this._hasFilterValue(searchableDropdown))
            .map(this._mapSearchableDropdownItem);

        const updatedFilters = [...dropdownFilters, ...searchableFilters];

        if (isEqual(this.filter$.getValue(), updatedFilters)) { return; }

        this.filter$.next([...dropdownFilters, ...searchableFilters]);
    }

    private _hasFilterValue = (dropdown?: UiGridSearchFilterDirective<T> | UiGridDropdownFilterDirective<T>) =>
        !!dropdown &&
        dropdown.value

    private _mapDropdownItem = (column: UiGridColumnDirective<T>) => ({
        method: column.dropdown!.method,
        property: column.property,
        value: column.dropdown!.value!.value,
    }) as IFilterModel<T>

    private _mapSearchableDropdownItem = (column: UiGridColumnDirective<T>): IFilterModel<T> => ({
        method: column.searchableDropdown!.method,
        property: column.searchableDropdown!.property || column.property,
        value: column.searchableDropdown!.value!.id,
    }) as IFilterModel<T>
}

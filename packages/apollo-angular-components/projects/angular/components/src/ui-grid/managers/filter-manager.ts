import isEqual from 'lodash-es/isEqual';
import { BehaviorSubject } from 'rxjs';

import { ISuggestValue } from '../../ui-suggest/models';
import { UiGridColumnDirective } from '../body/ui-grid-column.directive';
import { IDropdownOption } from '../filters/ui-grid-dropdown-filter.directive';
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
        this._filterUpdate();
    }

    public destroy() {
        this.filter$.complete();
    }

    public searchableDropdownUpdate(column?: UiGridColumnDirective<T>, value?: ISuggestValue) {
        if (column) {
            column.searchableDropdown!.updateValue(value);
            column.searchableDropdown!.filterChange.emit(value ? this._mapSearchableDropdownItem(column) : null);
        }

        this._filterUpdate();
    }

    public dropdownUpdate(column?: UiGridColumnDirective<T>, value?: IDropdownOption) {
        if (column) {
            column.dropdown!.updateValue(value);
            column.dropdown!.filterChange.emit(value ? this._mapDropdownItem(column) : null);
        }

        this._filterUpdate();
    }

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

    private _filterUpdate() {
        const dropdownFilters = this._columns
            .filter(c =>
                !!c.dropdown &&
                c.dropdown.value,
            )
            .map(this._mapDropdownItem);

        const searchableFilters = this._columns
            .filter(c =>
                !!c.searchableDropdown &&
                c.searchableDropdown.value,
            )
            .map(this._mapSearchableDropdownItem);

        const updatedFilters = [...dropdownFilters, ...searchableFilters];

        if (isEqual(this.filter$.getValue(), updatedFilters)) { return; }

        this.filter$.next([...dropdownFilters, ...searchableFilters]);
    }

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

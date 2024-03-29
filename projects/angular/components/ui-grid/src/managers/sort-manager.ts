import isEqual from 'lodash-es/isEqual';
import { BehaviorSubject } from 'rxjs';

import { SortDirection } from '@angular/material/sort';

import { UiGridColumnDirective } from '../body/ui-grid-column.directive';
import { ISortModel } from '../models';

/**
 * @internal
 * @ignore
 */
const SORT_CYCLE_MAP: Record<SortDirection, SortDirection> = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '': 'asc',
    asc: 'desc',
    desc: '',
};

/**
 * Handles the sort state of every grid column.
 *
 * @export
 * @ignore
 * @internal
 */
export class SortManager<T> {
    sort$ = new BehaviorSubject<ISortModel<T>>({} as ISortModel<T>);

    constructor(
        private _columns: UiGridColumnDirective<T>[] = [],
    ) { }

    get columns() {
        return this._columns;
    }

    set columns(columns: UiGridColumnDirective<T>[]) {
        this._columns = columns;

        const sortedColumn = columns.find(column => column.sort !== '');

        if (!sortedColumn) {
            if (!isEqual(this.sort$.getValue(), {})) {
                this.sort$.next({} as ISortModel<T>);
            }
            return;
        }

        this._emitSort(sortedColumn);
    }
    /**
     * Sort based on user action on column header
     */
    changeSort(column: UiGridColumnDirective<T>) {
        if (!column.sortable) { return; }

        this._columns
            .filter(c => c.sortable && c.property !== column.property)
            .forEach(c => c.sort = '');

        column.sort = SORT_CYCLE_MAP[column.sort];

        this._emitSort(column, true);
    }

    clear() {
        this._columns
            .filter(c => c.sortable)
            .forEach(c => c.sort = '');
    }

    destroy() {
        this.sort$.complete();
    }

    private _emitSort(column: UiGridColumnDirective<T>, userEvent = false) {
        const updatedSort = {
            direction: column.sort,
            field: column.queryProperty ?? column.property,
            title: column.title,
            userEvent,
        } as ISortModel<T>;

        if (isEqual(this.sort$.getValue(), updatedSort)) { return; }

        this.sort$.next(updatedSort);
    }
}

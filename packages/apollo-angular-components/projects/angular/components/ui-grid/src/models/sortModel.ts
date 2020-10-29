import { SortDirection } from '@angular/material/sort';

/**
 * Sort model schemal
 *
 * @export
 */
export interface ISortModel<T> {
    /**
     * The sort direction.
     *
     */
    direction: SortDirection;
    /**
     * The target sort field.
     *
     */
    field: keyof T | string;
    /**
     * The sorted column title.
     *
     */
    title: string;
    /**
     * Sort event as a result of direct user intent to sort by a column.
     *
     */
    userEvent?: boolean;
}

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
}

import { SortDirection } from '@angular/material/sort';

export interface ISortModel<T> {
    direction: SortDirection;
    field: keyof T | string;
    title: string;
}

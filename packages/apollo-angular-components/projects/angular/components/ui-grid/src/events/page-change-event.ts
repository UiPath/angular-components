import { PageEvent } from '@angular/material/paginator';

export type PageChangeEvent = Omit<PageEvent, 'length'> & {
    length?: number | null;
};

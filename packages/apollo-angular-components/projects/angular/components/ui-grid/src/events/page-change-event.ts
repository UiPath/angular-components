import { LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';

export type PageChangeEvent = Omit<PageEvent, 'length'> & {
    length?: number | null;
};

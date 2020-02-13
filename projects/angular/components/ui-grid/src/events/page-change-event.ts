import { PageEvent } from '@angular/material/paginator';

export type PageChangeEvent = Omit<PageEvent, 'length'> & {
    length?: number | null;
};

// TODO: remove Omit declaration when upgrading to TypeScript 3.5
// https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-5.html
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

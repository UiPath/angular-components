import { Observable } from 'rxjs';

import { ISuggestValues } from '@uipath/angular/components/ui-suggest';

export type SearchSourceFactory<T> = (searchTerm: string, take: number, skip: number) => Observable<ISuggestValues<T>>;

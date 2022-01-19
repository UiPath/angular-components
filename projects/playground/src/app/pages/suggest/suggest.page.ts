import { range } from 'lodash';
import {
    Observable,
    of,
} from 'rxjs';
import {
    delay,
    switchMap,
    tap,
} from 'rxjs/operators';

import {
    ChangeDetectionStrategy,
    Component,
} from '@angular/core';
import { ISuggestValues } from '@uipath/angular/components/ui-suggest';

@Component({
  selector: 'ui-app-suggest',
  templateUrl: './suggest.page.html',
  styleUrls: ['./suggest.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuggestPageComponent {

  constructor() { }

  getResults(searchTerm: string): Observable<ISuggestValues<any>> {
    const options = range(0, 20).map(idx => ({
      id: idx,
      text: `Element ${idx}`,
      expandable: true,
    }));

    const filteredOptions = options.filter(option => option.text.includes(searchTerm.trim()));

    return of({
      total: filteredOptions.length,
      data: filteredOptions,
    });
  }

  searchSourceFactory: SearchSourceFactory = (searchTerm = '', top = 10, skip = 0) => of(searchTerm).pipe(
    switchMap(this.getResults),
    tap((results: any) => console.log({
      searchTerm,
      top,
      skip,
      results,
    })),
    delay(50),
  );
}

type SearchSourceFactory = (searchTerm?: string, fetchCount?: number, skip?: number) => Observable<ISuggestValues<any>>;

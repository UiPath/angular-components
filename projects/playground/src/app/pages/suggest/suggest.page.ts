import { range } from 'lodash';
import {
    Observable,
    of,
} from 'rxjs';
import {
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
    }));

    const filteredOptions = options.filter(option => option.text.includes(searchTerm));

    return of({
      total: filteredOptions.length,
      data: filteredOptions,
    });
  }

  searchSourceFactory: SearchSourceFactory = (searchTerm = '') => of(searchTerm).pipe(
    switchMap(this.getResults),
    // delay(500),
    tap(console.log),
  );
}

type SearchSourceFactory = (searchTerm?: string, fetchCount?: number, skip?: number) => Observable<ISuggestValues<any>>;

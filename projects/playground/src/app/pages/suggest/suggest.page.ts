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
import {
  ISuggestValue, ISuggestValues,
} from '@uipath/angular/components/ui-suggest';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'ui-app-suggest',
  templateUrl: './suggest.page.html',
  styleUrls: ['./suggest.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuggestPageComponent {
  control = new FormControl<ISuggestValue[]>([]);

  constructor() { }

  itemClicked(item: ISuggestValue) {
    this.control.setValue([item]);
  }

  isItemAdded(item: ISuggestValue) {
    const value = this.control.value;
    if (!value) {
      return false;
    }

    return value.findIndex(itm => item.id === itm.id) !== -1;
  }

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

  generateData({ searchTerm = '', take = 20, skip = 0 }): Observable<ISuggestValues<any>> {
    const options = range(0 + skip, 0 + skip + take).map(idx => ({
      id: idx,
      text: `Element ${idx}`,
    }));

    const filteredOptions = options.filter(option => option.text.includes(searchTerm.trim()));

    if (skip >= 100) {
      return of({
        data: [],
      });
    }

    return of({
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

  lazySearchSourceFactory: SearchSourceFactory = (searchTerm = '', top = 20, skip = 0) => this.generateData({
    searchTerm,
    take: top,
    skip,
  }).pipe(
    tap((results: any) => console.log({
      top,
      skip,
      results,
    })),
    delay(1000),
  );
}

type SearchSourceFactory = (searchTerm?: string, fetchCount?: number, skip?: number) => Observable<ISuggestValues<any>>;

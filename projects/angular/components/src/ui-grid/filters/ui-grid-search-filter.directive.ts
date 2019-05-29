import {
  Directive,
  Input,
  OnDestroy,
} from '@angular/core';

import { Observable } from 'rxjs';

import {
  ISuggestValue,
  ISuggestValues,
} from '../../ui-suggest/models';
import { UiGridFilter } from './ui-grid-filter';

@Directive({
    selector: '[uiGridSearchFilter], ui-grid-search-filter',
})
export class UiGridSearchFilterDirective<T> extends UiGridFilter<T> implements OnDestroy {
    @Input()
    public property?: string;

    @Input()
    public noFilterPlaceholder?: string;

    @Input()
    public searchSourceFactory?: (searchTerm?: string, fetchSize?: number) => Observable<ISuggestValues<any>>;

    @Input()
    public value?: ISuggestValue;

    public updateValue(value?: ISuggestValue) {
        this.value = value;
    }

    ngOnDestroy() {
        this.filterChange.complete();
    }
}

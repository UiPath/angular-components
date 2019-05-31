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

/**
 * The searchable dropdown definition directive.
 *
 * @export
 */
@Directive({
  selector: '[uiGridSearchFilter], ui-grid-search-filter',
})
export class UiGridSearchFilterDirective<T> extends UiGridFilter<T> implements OnDestroy {
  /**
   * The property associated to the dropdown search.
   *
   */
  @Input()
  public property?: string;

  /**
   * The no selection placeholder.
   *
   */
  @Input()
  public noFilterPlaceholder?: string;

  /**
   * Stream factory, used to resolve a stream for the provided options.
   *
   * @param searchTerm The current searched term.
   * @param fetchSize The next chunk size that needs to be loaded.
   */
  @Input()
  public searchSourceFactory?: (searchTerm?: string, fetchSize?: number) => Observable<ISuggestValues<any>>;

  /**
   * The current dropdown options.
   *
   */
  @Input()
  public value?: ISuggestValue;

  /**
   * Updates the dropdown option.
   *
   */
  public updateValue(value?: ISuggestValue) {
    this.value = value;
  }

  /**
   * @ignore
   */
  ngOnDestroy() {
    this.filterChange.complete();
  }
}

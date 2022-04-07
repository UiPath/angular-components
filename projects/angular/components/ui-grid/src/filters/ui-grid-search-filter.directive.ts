import {
    BehaviorSubject,
    Observable,
} from 'rxjs';

import {
    Directive,
    Input,
    OnDestroy,
} from '@angular/core';
import {
    ISuggestValue,
    ISuggestValues,
} from '@uipath/angular/components/ui-suggest';

import { UiGridFilterDirective } from './ui-grid-filter';

/**
 * The searchable dropdown definition directive.
 *
 * @export
 */
@Directive({
    selector: '[uiGridSearchFilter], ui-grid-search-filter',
})
export class UiGridSearchFilterDirective<T> extends UiGridFilterDirective<T> implements OnDestroy {
    /**
     * The property associated to the dropdown search fetch strategy.
     *
     */
    @Input()
    fetchStrategy?: 'eager' | 'onOpen';

    /**
     * The property associated to the dropdown search.
     *
     */
    @Input()
    property?: string;

    /**
     * The no selection placeholder.
     *
     */
    @Input()
    noFilterPlaceholder?: string;

    /**
     * Allow filter drill down
     *
     */
    @Input()
    drillDown = false;

    /**
     * Stream factory, used to resolve a stream for the provided options.
     *
     * @param searchTerm The current searched term.
     * @param fetchSize The next chunk size that needs to be loaded.
     */
    @Input()
    searchSourceFactory?: (searchTerm?: string, fetchSize?: number) => Observable<ISuggestValues<any>>;

    /**
     * The current dropdown options.
     *
     */
    @Input()
    value?: ISuggestValue | ISuggestValue[];

    /**
     * Wether the filter should be rendered in the grid.
     *
     */
    @Input()
    get visible() { return this.visible$.value; }
    set visible(visible: boolean) { this.visible$.next(visible); }

    /**
     * @ignore
     */
    visible$ = new BehaviorSubject(true);

    /**
     * Updates the dropdown option.
     *
     */
    updateValue(value?: ISuggestValue | ISuggestValue[]) {
        this.value = value;
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        super.ngOnDestroy();
        this.filterChange.complete();
    }
}

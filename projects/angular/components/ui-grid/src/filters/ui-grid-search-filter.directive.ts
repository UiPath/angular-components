import {
    Directive,
    Input,
    OnDestroy,
} from '@angular/core';
import {
    ISuggestValue,
    ISuggestValues,
} from '@uipath/angular/components/ui-suggest';

import {
    BehaviorSubject,
    Observable,
} from 'rxjs';

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
     * Wether the filter should be rendered in the grid.
     *
     */
    @Input()
    public get visible() { return this.visible$.value; }
    public set visible(visible: boolean) { this.visible$.next(visible); }

    /**
     * @ignore
     */
    public visible$ = new BehaviorSubject(true);

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
        super.ngOnDestroy();
        this.filterChange.complete();
    }
}

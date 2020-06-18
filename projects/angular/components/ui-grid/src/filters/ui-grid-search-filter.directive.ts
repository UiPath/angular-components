import {
    Directive,
    Inject,
    InjectionToken,
    Input,
    OnDestroy,
    Optional,
} from '@angular/core';
import {
    ISuggestValue,
    ISuggestValues,
    SuggestSearchStrategy,
} from '@uipath/angular/components/ui-suggest';

import {
    BehaviorSubject,
    Observable,
} from 'rxjs';

import { UiGridFilterDirective } from './ui-grid-filter';

export interface IGridSearchFilterOptions {
    fetchStrategy: SuggestSearchStrategy;
}

export const UI_GRID_SEARCH_FILTER_DEFAULT_OPTIONS = new InjectionToken<IGridSearchFilterOptions>('UiGridSearchFilterDirective options.');

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
     * Configure the `fetchStrategy` for requesting data using searchSourceFactory
     * `eager` - makes calls to searchSourceFactory onInit
     * `onOpen` - makes calls to searchSourceFactory onOpen
     */
    @Input()
    public fetchStrategy: SuggestSearchStrategy;

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

    constructor(
        @Inject(UI_GRID_SEARCH_FILTER_DEFAULT_OPTIONS)
        @Optional()
        options: IGridSearchFilterOptions,
    ) {
        super();

        this.fetchStrategy = options?.fetchStrategy || 'eager';
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        super.ngOnDestroy();
        this.filterChange.complete();
    }
}

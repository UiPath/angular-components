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
     * Allow multiple selection
     *
     */
    @Input()
    multiple = false;

    /**
     * @ignore
     */
    visible$ = new BehaviorSubject(true);

    /**
     * Updates the dropdown option.
     *
     */
    updateValue(value?: ISuggestValue, isSelected?: boolean) {
        if (!value) {
            return;
        }

        if (this.multiple) {
            if (!this.value) {
                this.value = [];
            }

            if (isSelected) {
                (this.value as ISuggestValue[]).push(value);
            } else {
                const index = (this.value as ISuggestValue[]).findIndex(item => item.id === value.id);
                if (index > -1) {
                    (this.value as ISuggestValue[]).splice(index, 1);
                }
            }
        } else {
            this.value = value;
        }
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        super.ngOnDestroy();
        this.filterChange.complete();
    }
}

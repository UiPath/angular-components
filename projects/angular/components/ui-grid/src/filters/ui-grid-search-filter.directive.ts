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
     * Configure the minimum number of characters that triggers the searchSourceFactory call
     * This will have priority over the fetch strategy if set.
     *
     */
    @Input()
    minChars = 0;

    /**
     * The maximum number of items rendered in the viewport.
     *
     */
    @Input()
    displayCount = 10;

    /**
     * @ignore
     */
    visible$ = new BehaviorSubject(true);

    /**
     * Updates the dropdown option.
     *
     */
    updateValue(value?: ISuggestValue, isSelected?: boolean) {
        if (this.multiple) {
            this.handleMultiple(value, isSelected);
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

    get hasValue() {
        return this.multiple
            ? (this.value as ISuggestValue[] ?? []).length > 0
            : this.value != null;
    }

    private checkAlreadyExisting(value: ISuggestValue, isSelected?: boolean) {
        if (this.multiple) {
            return (isSelected && (this.value as ISuggestValue[] ?? []).find(item => item.id === value.id));
        }

        return false;
    }

    private handleMultiple(value?: ISuggestValue, isSelected?: boolean) {
        if (!value) {
            this.value = [];
            return;
        }

        if (this.checkAlreadyExisting(value, isSelected)) {
            return;
        }

        if (!this.value) {
            this.value = [];
        }

        if (isSelected) {
            (this.value as ISuggestValue[]).push(value);
        } else {
            this.removeElement(value);
        }
    }

    private removeElement(value: ISuggestValue) {
        this.value = this.value as ISuggestValue[];

        const index = this.value.findIndex(item => item.id === value.id);
        if (index > -1) {
            this.value.splice(index, 1);
        }
    }
}

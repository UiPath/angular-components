import { Subject } from 'rxjs';

import {
    Injectable,
    OnDestroy,
} from '@angular/core';

/**
 * Internationalization service definition for `UiSuggest`.
 *
 * @export
 */
@Injectable()
export class UiSuggestIntl implements OnDestroy {
    /**
     * Label displayed when you re-enter an existing custom value.
     *
     */
    customValueAlreadySelected = 'This item is already added.';
    /**
     * Label for the selection clear tooltip.
     *
     */
    clearSelectionLabel = 'Clear Selection';
    /**
     * Label displayed when no results are available.
     *
     */
    noResultsLabel = 'No results';
    /**
     * Label displayed when an item is in a loading state.
     *
     */
    loadingLabel = 'Loading...';
    /**
     * Label announced by the a11y live announcer for custom values.
     *
     */
    customValueLiveLabel = 'Custom value';

    /**
     * Notify if changes have occurred that require that the labels be updated.
     *
     */
    // eslint-disable-next-line rxjs/finnish
    changes = new Subject<void>();

    protected _destroyed$ = new Subject<void>();

    /**
     * Live announced label for the current item.
     *
     * @param text The text of the active item.
     * @param itemNo The current item index.
     * @param itemCount The total item count.
     */
    currentItemLabel = (text: string, itemNo: number, itemCount: number, selectedStatus?: boolean) => `${text}${this._selectedStatusText(selectedStatus)} item ${itemNo} out of ${itemCount}`;

    currentItemSelectionStatus = (text: string, isItemSelected: boolean) => `${text} item is ${isItemSelected ? 'selected' : 'removed from selection'}`;

    /**
     * Custom value label generator function.
     *
     * @param text The text of the custom value.
     */
    customValueLabel = (text: string) => text;

    /**
     * Label displayed when minimum number of characters to trigger the search is not met.
     *
     */
    minCharsLength = (length: number) => length === 1
        ? 'Please start typing to search'
        : `Please type at least ${length} characters to search`;

    /**
     * Value label generator function.
     *
     * @param text The text of the value.
     */
    translateLabel = (text: string) => text;

    /**
     * @ignore
     */
    ngOnDestroy() {
        this._destroyed$.next();
        this._destroyed$.complete();
        this.changes.complete();
    }

    private _selectedStatusText(selectedStatus?: boolean) {
        if (selectedStatus) {
            return ' (selected)';
        }

        return '';
    }
}

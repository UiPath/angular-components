import {
    Injectable,
    OnDestroy,
} from '@angular/core';

import { Subject } from 'rxjs';

/**
 * Internationalization service definition for `UiSuggest`.
 *
 * @export
 */
@Injectable()
export class UiSuggestIntl implements OnDestroy {
    /**
     * Label for the selection clear tooltip.
     *
     */
    public clearSelectionLabel = 'Clear Selection';
    /**
     * Label displayed when no results are available.
     *
     */
    public noResultsLabel = 'No results';
    /**
     * Label displayed when an item is in a loading state.
     *
     */
    public loadingLabel = 'Loading...';
    /**
     * Label announced by the a11y live announcer for custom values.
     *
     */
    public customValueLiveLabel = 'Custom value';

    /**
     * Notify if changes have occurred that require that the labels be updated.
     *
     */
    public changes = new Subject();

    protected _destroyed$ = new Subject<void>();

    /**
     * Live announced label for the current item.
     *
     * @param text The text of the active item.
     * @param itemNo The current item index.
     * @param itemCount The total item count.
     */
    public currentItemLabel = (text: string, itemNo: number, itemCount: number) => `${text} item ${itemNo} out of ${itemCount}`;

    /**
     * Custom value label generator function.
     *
     * @param text The text of the custom value.
     */
    public customValueLabel = (text: string) => text;

    /**
     * Value label generator function.
     *
     * @param text The text of the value.
     */
    public translateLabel = (text: string) => text;

    /**
     * @ignore
     */
    ngOnDestroy() {
        this._destroyed$.next();
        this._destroyed$.complete();
        this.changes.complete();
    }
}

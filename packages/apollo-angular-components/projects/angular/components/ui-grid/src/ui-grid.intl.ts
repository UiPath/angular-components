import { OnDestroy } from '@angular/core';

import { Subject } from 'rxjs';

import { IDropdownOption } from './filters/ui-grid-dropdown-filter.directive';

/**
 * Internationalization service definition for `UiGrid`.
 *
 * @export
 */
export class UiGridIntl implements OnDestroy {
    /**
     * Notify if changes have occured that require that the labels be updated.
     *
     */
    public changes = new Subject();

    /**
     * Live announcer refresh message.
     *
     */
    public pageRefreshing = 'Page refreshing';

    /**
     * Refresh button tooltip.
     *
     */
    public refreshTooltip = 'Refresh';
    /**
     * Search tooltip.
     *
     */
    public searchTooltip = 'Search';
    /**
     * Clear search tooltip.
     *
     */
    public clearTooltip = 'Clear';
    /**
     * Clear multi-page selection tooltip.
     *
     */
    public clearSelectionTooltip = 'Clear Selection';
    /**
     * Multi-page selection information tootlip.
     *
     */
    public multiPageSelectionInfoTooltip = 'Multi-page selection is enabled.';

    /**
     * No active filter placeholder.
     *
     */
    public noFilterPlaceholder = 'All';
    /**
     * Search placeholder.
     *
     */
    public searchPlaceholder = 'Search';
    /**
     * No data row message.
     *
     */
    public noDataMessage = 'No data is available.';
    /**
     * No selection text (for multi-page selection).
     *
     */
    public noSelectionMessage = 'No items currently selected.';
    /**
     * Ascending `aria-sort` text.
     *
     */
    public ascending = 'ascending';
    /**
     * Descending `aria-sort` text.
     *
     */
    public descending = 'descending';

    /**
     * Generates a selection label for the given count.
     *
     * @param count The total selection count.
     */
    public translateMultiPageSelectionCount =
    (count: number) => `You have selected ${count} items.`

    /**
     * Live announcer page loaded state notification.
     *
     * @param page The current loaded page number.
     * @param renderedItemCount The number of rendered items.
     * @param total The total number of items available.
     */
    public loadedPage = (page: number, renderedItemCount: number, total: number) =>
        `Loaded page number ${page} containing ${renderedItemCount} out of ${total} items`

    /**
     * Live announcer page loading state notification.
     *
     * @param page The current loaded page number.
     */
    public loadingPage = (page: number) =>
        `Loading page number ${page}`

    /**
     * Handles dropdown label transaltions.
     *
     * @param option The current dropdown option.
     */
    public translateDropdownOption =
    (option: IDropdownOption) => option.label

    /**
     * Live announcer sort ascending notification.
     *
     * @param columnTitle The sorted column title.
     */
    public columnSortedAscending = (columnTitle: string) =>
        `Column ${columnTitle} sorted ` + this.ascending

    /**
     * Live announcer sort descending notification.
     *
     * @param columnTitle The sorted column title.
     */
    public columnSortedDescending = (columnTitle: string) =>
        `Column ${columnTitle} sorted ` + this.descending

    /**
     * Live announcer sort unsorted notification.
     *
     * @param columnTitle The sorted column title.
     */
    public columnUnsorted = (columnTtile: string) =>
        `Column ${columnTtile} unsorted`

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.changes.complete();
    }
}

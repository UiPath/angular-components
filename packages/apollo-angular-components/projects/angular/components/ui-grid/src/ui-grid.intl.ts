import { Subject } from 'rxjs';

import {
    Injectable,
    OnDestroy,
} from '@angular/core';

import { IDropdownOption } from './filters/ui-grid-dropdown-filter.directive';

/**
 * Internationalization service definition for `UiGrid`.
 *
 * @export
 */
@Injectable()
export class UiGridIntl implements OnDestroy {
    /**
     * Notify if changes have occured that require that the labels be updated.
     *
     */
    // eslint-disable-next-line rxjs/finnish
    changes = new Subject<void>();

    /**
     * Live announcer refresh message.
     *
     */
    pageRefreshing = 'Page refreshing';

    /**
     * Refresh button tooltip.
     *
     */
    refreshTooltip = 'Refresh';
    /**
     * Search tooltip.
     *
     */
    searchTooltip = 'Search';
    /**
     * Clear search tooltip.
     *
     */
    clearTooltip = 'Clear';
    /**
     * Clear multi-page selection tooltip.
     *
     */
    clearSelectionTooltip = 'Clear Selection';
    /**
     * Multi-page selection information tootlip.
     *
     */
    multiPageSelectionInfoTooltip = 'Multi-page selection is enabled.';

    /**
     * No active filter placeholder.
     *
     */
    noFilterPlaceholder = 'All';
    /**
     * Search placeholder.
     *
     */
    searchPlaceholder = 'Search';
    /**
     * Tooltip for toggle columns select dropdown
     *
     */
    toggleTooltip = 'Toggle column visibility';
    /**
     * Tooltip for resetting to column defaults
     *
     */
    toggleResetToDefaults = 'Reset';
    /**
     * Main title for visible columns displayed within the dropdown
     *
     */
    toggleTitle = 'Visible Columns';
    /**
     * Text displayed next to icon for dropdown
     *
     */
    togglePlaceholderTitle = 'Columns';
    /**
     * No data row message.
     *
     */
    noDataMessage = 'No data is available.';
    /**
     * No selection text (for multi-page selection).
     *
     */
    noSelectionMessage = 'No items currently selected.';
    /**
     * Ascending `aria-sort` text.
     *
     */
    ascending = 'ascending';
    /**
     * Descending `aria-sort` text.
     *
     */
    descending = 'descending';
    /**
     * Live announced text when new action buttons are revealed on selection
     *
     */
    gridHeaderActionsNotice = 'Grid header actions updated. Press Shift + Alt + Arrow Up to move there.';
    /**
     * No data row message alternative function.
     *
     */
    noDataMessageAlternative = (searchValue?: string, activeFilters?: number | null) =>
        `No data is available${searchValue ? ` for ${searchValue}` : ''}${activeFilters ? ' for applied filters' : ''}.`;
    /**
     * Determines the `checkbox` `matToolTip`.
     *
     * @param [rowIndex] The rowIndex for which the label is computed.
     */
    checkboxTooltip(selected: boolean, rowIndex?: number): string {
        if (rowIndex == null) {
            return `${selected ? 'Deselect' : 'Select'} all`;
        }
        return `${selected ? 'Deselect' : 'Select'} row ${rowIndex}`;
    }

    /**
     * Generates a selection label for the given count.
     *
     * @param count The total selection count.
     */
    translateMultiPageSelectionCount =
        (count: number) => `You have selected ${count} items.`;

    /**
     * Live announcer page loaded state notification.
     *
     * @param page The current loaded page number.
     * @param renderedItemCount The number of rendered items.
     * @param total The total number of items available.
     */
    loadedPage = (page: number, renderedItemCount: number, total?: number | null) => {
        if (total == null || isNaN(total)) {
            return `Loaded page number ${page} containing ${renderedItemCount} items`;
        }

        return `Loaded page number ${page} containing ${renderedItemCount} out of ${total} items`;
    };

    /**
     * Live announcer page loading state notification.
     *
     * @param page The current loaded page number.
     */
    loadingPage = (page: number) =>
        `Loading page number ${page}`;

    filters = (filtersCount?: number | null) =>
        (filtersCount && filtersCount > 0)
            ? `Filters (${filtersCount})`
            : 'Filters';

    /**
     * Handles dropdown label transaltions.
     *
     * @param option The current dropdown option.
     */
    translateDropdownOption =
        (option: IDropdownOption) => option.label;

    /**
     * Live announcer sort ascending notification.
     *
     * @param columnTitle The sorted column title.
     */
    columnSortedAscending = (columnTitle: string) =>
        `Column ${columnTitle} sorted ` + this.ascending;

    /**
     * Live announcer sort descending notification.
     *
     * @param columnTitle The sorted column title.
     */
    columnSortedDescending = (columnTitle: string) =>
        `Column ${columnTitle} sorted ` + this.descending;

    /**
     * Live announcer sort unsorted notification.
     *
     * @param columnTitle The sorted column title.
     */
    columnUnsorted = (columnTtile: string) =>
        `Column ${columnTtile} unsorted`;

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.changes.complete();
    }
}

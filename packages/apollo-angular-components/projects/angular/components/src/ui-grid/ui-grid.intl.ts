import { OnDestroy } from '@angular/core';

import { Subject } from 'rxjs';

import { IDropdownOption } from './filters';

export class UiGridIntl implements OnDestroy {
    public changes = new Subject();

    public pageRefreshing = 'Page refreshing';

    public refreshTooltip = 'Refresh';
    public searchTooltip = 'Search';
    public clearTooltip = 'Clear';

    public clearSelectionTooltip = 'Clear Selection';

    public multiPageSelectionInfoTooltip = 'Multi-page selection is enabled.';

    public noFilterPlaceholder = 'All';
    public searchPlaceholder = 'Search';
    public noDataMessage = 'No data is available.';
    public noSelectionMessage = 'No items currently selected.';

    public ascending = 'ascending';
    public descending = 'descending';

    public translateMultiPageSelectionCount =
        (count: number) => `You have selected ${count} items.`

    public loadedPage = (page: number, showingItems: number, total: number) =>
        `Loaded page number ${page} containing ${showingItems} out of ${total} items`

    public loadingPage = (page: number) =>
        `Loading page number ${page}`

    public translateDropdownOption =
        (option: IDropdownOption) => option.label

    public columnSortedAscending = (columnTitle: string) =>
        `Column ${columnTitle} sorted ` + this.ascending

    public columnSortedDescending = (columnTitle: string) =>
        `Column ${columnTitle} sorted ` + this.descending

    public columnUnsorted = (columnTtile: string) =>
        `Column ${columnTtile} unsorted`

    ngOnDestroy() {
        this.changes.complete();
    }
}

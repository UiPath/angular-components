export interface IFooter {
    total: number;
    pageSize: number;
    hidePageSize: boolean;
    hideTotalCount?: boolean;
    showFirstLastButtons?: boolean;
}

export interface IHeader {
    searchable: boolean;
    showFilter: boolean;
    main: number;
    inline: number;
    action: number;
}

export interface IInputs {
    collapseFiltersCount: number;
    // deprecated
    collapsibleFilters?: boolean;
    loading: boolean;
    isProjected: boolean;
    hasHighDensity: boolean;
    disabled: boolean;
    selectable: boolean;
    singleSelectable: boolean;
    toggleColumns: boolean;
    multiPageSelect: boolean;
    refreshable: boolean;
    virtualScroll: boolean;
    showPaintTime: boolean;
    showHeaderRow: boolean;
    customFilter: boolean;
    useCardView: boolean;
    hideTotalCount: boolean;
    isScrollable: boolean;
    allowHighlight: boolean;
    swapFilterContainers: boolean;
    selectablePageIndex: boolean;
}

export interface IGridSettings {
    inputs: IInputs;
    header: IHeader;
    footer: IFooter;
}

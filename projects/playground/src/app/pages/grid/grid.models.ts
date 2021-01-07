export interface IFooter {
    total: number;
    pageSize: number;
    hidePageSize: boolean;
}

export interface IHeader {
    searchable: boolean;
    showFilter: boolean;
    main: number;
    inline: number;
    action: number;
}

export interface IInputs {
    useAlternateDesign: boolean;
    collapsibleFilters: boolean;
    loading: boolean;
    isProjected: boolean;
    disabled: boolean;
    selectable: boolean;
    toggleColumns: boolean;
    multiPageSelect: boolean;
    refreshable: boolean;
    virtualScroll: boolean;
    showPaintTime: boolean;
    showHeaderRow: boolean;
}

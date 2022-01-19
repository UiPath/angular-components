import {
    VirtualScrollItem,
    VirtualScrollItemStatus,
} from '@uipath/angular/directives/ui-virtual-scroll-range-loader';

/**
 * UiSuggest item schema.
 *
 * @export
 */
export interface ISuggestValue extends VirtualScrollItem {
    /**
     * Unique identifier associated to the entry.
     *
     */
    id: number | string;
    /**
     * Text associated to the entry.
     *
     */
    text: string;
    /**
     * Marks the current item state
     *
     * @internal
     * @ignore
     */
    loading?: VirtualScrollItemStatus;
    /**
     * Flag that marks custom items.
     *
     * @internal
     * @ignore
     */
    isCustom?: boolean;
    /**
     * Flag that marks if item is expandable.
     * Will be ignored if ui-suggest doesn't have drillDown and searchable.
     * On selection will trigger a new searchSource call, value will NOT updated yet.
     * The string input will be applied as `${item.text}:`
     */
    expandable?: boolean;
    /**
     * Optional icon that will be displayed to the left of the item.
     *
     */
    icon?: {
        iconOnly?: boolean;
        svgIcon?: string;
        matIcon?: string;
    };
}

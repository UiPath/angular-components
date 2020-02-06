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
  * @internal
  * @ignore
  */
    loading?: VirtualScrollItemStatus;
    /**
  * Flag that marks custom items.
  * @internal
  * @ignore
  */
    isCustom?: boolean;
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

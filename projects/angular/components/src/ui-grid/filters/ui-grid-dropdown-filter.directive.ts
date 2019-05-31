import {
  Directive,
  Input,
  OnDestroy,
} from '@angular/core';

import { UiGridFilter } from './ui-grid-filter';

/**
 * Dropdown option schema.
 *
 * @export
 */
export interface IDropdownOption {
    /**
     * The current dropdown value.
     *
     */
    value: string | number | boolean;
    /**
     * The dropdown option label.
     *
     */
    label: string;
    /**
     * The dropdown translation key, used by the `intl` service.
     *
     */
    translationKey?: string;
}

/**
 * The dropdown filter definition directive.
 *
 * @export
 */
@Directive({
    selector: '[uiGridDropdownFilter], ui-grid-dropdown-filter',
})
export class UiGridDropdownFilterDirective<T> extends UiGridFilter<T> implements OnDestroy {
    /**
     * The dropdown items.
     *
     */
    @Input()
    public items?: IDropdownOption[];

    /**
     * If it should display the `All` option.
     *
     */
    @Input()
    public showAllOption = true;

    /**
     * The current dropdown option.
     *
     */
    @Input()
    public value?: IDropdownOption;

    /**
     * Updates the dropdown value.
     *
     */
    public updateValue(value?: IDropdownOption) {
        this.value = value;
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.filterChange.complete();
    }
}

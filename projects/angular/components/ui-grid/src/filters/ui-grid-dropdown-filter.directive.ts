import { BehaviorSubject } from 'rxjs';

import {
    Directive,
    Input,
    OnDestroy,
} from '@angular/core';

import { UiGridFilterDirective } from './ui-grid-filter';

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
export class UiGridDropdownFilterDirective<T> extends UiGridFilterDirective<T> implements OnDestroy {
    /**
     * The dropdown items.
     *
     */
    @Input()
    items?: IDropdownOption[];

    /**
     * If it should display the `All` option.
     *
     */
    @Input()
    showAllOption = true;

    /**
     * The current dropdown option.
     *
     */
    @Input()
    value?: IDropdownOption | IDropdownOption[];

    /**
     * The empty dropdown state.
     *
     */
    @Input()
    emptyStateValue?: IDropdownOption['value'];
    /**
     * Wether the filter should be rendered in the grid.
     *
     */
    @Input()
    get visible() { return this.visible$.value; }
    set visible(visible: boolean) { this.visible$.next(visible); }

    /**
     * @ignore
     */
    visible$ = new BehaviorSubject(true);

    /**
     * Updates the dropdown value.
     *
     */
    updateValue(value?: IDropdownOption | IDropdownOption[]) {
        this.value = value;
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        super.ngOnDestroy();
        this.filterChange.complete();
    }
}

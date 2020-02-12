import {
    Directive,
    Input,
    OnDestroy,
} from '@angular/core';

import { BehaviorSubject } from 'rxjs';

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
     * Wether the filter should be rendered in the grid.
     *
     */
    @Input()
    public get visible() { return this.visible$.value; }
    public set visible(visible: boolean) { this.visible$.next(visible); }

    /**
     * @ignore
     */
    public visible$ = new BehaviorSubject(true);

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
        super.ngOnDestroy();
        this.filterChange.complete();
    }
}

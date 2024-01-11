import { isArray } from 'lodash-es';
import { BehaviorSubject } from 'rxjs';

import {
    Directive,
    Input,
    OnDestroy,
} from '@angular/core';
import { ISuggestValueData } from '@uipath/angular/components/ui-suggest';

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

export type FilterDropdownPossibleOption = IDropdownOption | IDropdownOption[] | undefined;
export type ISuggestDropdownValueData = ISuggestValueData<IDropdownOption['value']>;

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
    set items(value: IDropdownOption[]) {
        this._items = value;
        this.suggestItems = value.map((item, idx) => ({
            id: idx + 1,
            text: item.label,
            data: item.value,
        }));
    }
    get items() { return this._items!; }

    /**
     * If true multiple values can be selected in the dropdown filter.
     *
     */
    @Input()
    set multi(value: boolean) {
        this._multi = value;
        this.updateValue(this.value);
    }
    get multi() {
        return this._multi;
    }

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
    set value(v: FilterDropdownPossibleOption) {
        this.updateValue(v);
    }
    get value() {
        return this._value!;
    }

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
    suggestValue: ISuggestDropdownValueData[] = [];

    /**
     * Dropdown items expressed as ISuggestDropdownValueData
     */
    suggestItems: ISuggestDropdownValueData[] = [];

    private _items?: IDropdownOption[];
    private _value: FilterDropdownPossibleOption;
    private _multi = false;

    /**
     * Updates the dropdown value.
     *
     */
    updateValue(value?: FilterDropdownPossibleOption) {
        if (this.multi && !isArray(value) && !!value) {
            value = [value];
        }

        this._value = value;
        this.updateSuggestValue(value);
    }

    updateSuggestValue(value?: FilterDropdownPossibleOption) {
        if (value === undefined) {
            this.suggestValue = [];
            return;
        }

        this.suggestValue = this.suggestItems.filter(item => isArray(value) && value.some(s => s.value === item?.data)
            || (!isArray(value) && value!.value === item?.data));
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        super.ngOnDestroy();
        this.filterChange.complete();
    }

    findDropDownOptionBySuggestValue(suggestValue: ISuggestDropdownValueData) {
        return this.items.find(item => item.value === suggestValue.data);
    }

    get hasValue() {
        return this.value != null && ((!isArray(this.value) && this.value?.value !== undefined) ||
            (isArray(this.value) && this.value.length));
    }
}

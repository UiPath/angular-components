import {
    isArray,
    isEqual,
} from 'lodash-es';
import {
    BehaviorSubject,
    Subject,
    takeUntil,
} from 'rxjs';

import {
    Directive,
    inject,
    Input,
    OnDestroy,
    OnInit,
} from '@angular/core';
import { ISuggestValueData } from '@uipath/angular/components/ui-suggest';

import { UiGridIntl } from '../ui-grid.intl';
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
export class UiGridDropdownFilterDirective<T> extends UiGridFilterDirective<T> implements OnDestroy, OnInit {
    /**
     * The dropdown items.
     *
     */
    @Input()
    set items(value: IDropdownOption[] | null) {
        this._items = value ?? [];
        this.suggestItems = this._items.map((item, idx) => ({
            id: idx + 1,
            text: this.intl.translateDropdownOption(item),
            data: item.value,
        }));
        this._addNoFilterOption();
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
    intl = inject(UiGridIntl, { optional: true }) ?? new UiGridIntl();
    suggestValue: ISuggestDropdownValueData[] = [];

    /**
     * Dropdown items expressed as ISuggestDropdownValueData
     */
    suggestItems: ISuggestDropdownValueData[] = [];

    private _items: IDropdownOption[] = [];
    private _value: FilterDropdownPossibleOption;
    private _multi = false;
    private _destroy$ = new Subject<void>();

    ngOnInit() {
        this._addNoFilterOption();

        this.intl.changes.pipe(
            takeUntil(this._destroy$),
        ).subscribe(() => {
            this.items = this._items;
            this.suggestValue = this.suggestValue.map(suggestValue => ({
                ...suggestValue,
                text: this.intl.translateDropdownOption(this.findDropDownOptionBySuggestValue(suggestValue)!),
            }));
        });
    }

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
        if (value == null) {
            this.suggestValue = [];
            return;
        }

        this.suggestValue = this.suggestItems.filter(item => isArray(value) && value.some(s => s.value === item?.data)
            || (!isArray(value) && value.value === item?.data));
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        super.ngOnDestroy();
        this.filterChange.complete();
        this._destroy$.complete();
        this._destroy$.next();
    }

    findDropDownOptionBySuggestValue(suggestValue: ISuggestDropdownValueData) {
        return this._items.find(item => isEqual(item.value, suggestValue.data));
    }

    get hasValue() {
        return this.value != null && ((!isArray(this.value) && this.value?.value !== undefined) ||
            (isArray(this.value) && this.value.length));
    }

    private _addNoFilterOption() {
        const allOption = {
            id: -1,
            text: this.intl.noFilterPlaceholder,
        };
        if (!this.multi && this.showAllOption) {
            if (this.suggestItems[0]?.id !== allOption.id) {
                this.suggestItems = [allOption, ...this.suggestItems];
            }
        } else {
            this.suggestItems = this.suggestItems.filter(item => item.id !== allOption.id);
        }
    }
}

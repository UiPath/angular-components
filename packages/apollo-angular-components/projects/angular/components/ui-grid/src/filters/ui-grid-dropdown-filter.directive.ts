import { isArray } from 'lodash-es';
import {
    BehaviorSubject,
    map,
} from 'rxjs';

import {
    Directive,
    Input,
    OnDestroy,
} from '@angular/core';
import { ISuggestValueData } from '@uipath/angular/components/ui-suggest';

import { UiGridFilterDirective } from './ui-grid-filter';

type Arrayify <T> = T extends T ? T[] : never;

export type FilterSingleValue = string | number | boolean;
export type FilterMultiValue = Arrayify<FilterSingleValue>;

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
    value: FilterSingleValue | FilterMultiValue;
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
        if (value) {
            this.selectedFilters$.next([]);
        }
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
    value?: IDropdownOption;

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
     * Current filter value selection.
     *
     */
    selectedFilters$ = new BehaviorSubject<IDropdownOption['value'] | undefined>(undefined);

    /**
     * Current filter selection expressed as ISuggestValue.
     *
     */
    suggestValue$ = this.selectedFilters$.pipe(
        map(selection => {
            const value = this.suggestItems?.filter(item =>
                (isArray(selection) && selection?.some(s => s === item?.data) || selection === item?.data));
            return value as ISuggestDropdownValueData[];
        }),
    );

    /**
     * Dropdown items expressed as ISuggestDropdownValueData
     */
    suggestItems: ISuggestDropdownValueData[] = [];

    private _items?: IDropdownOption[];
    private _multi = false;

    /**
     * Updates the dropdown value.
     *
     */
    updateValue(value?: IDropdownOption) {
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

import {
  Directive,
  Input,
  OnDestroy,
} from '@angular/core';

import { UiGridFilter } from './ui-grid-filter';

export interface IDropdownOption {
    value: string | number | boolean;
    label: string;
    translationKey?: string;
}

@Directive({
    selector: '[uiGridDropdownFilter], ui-grid-dropdown-filter',
})
export class UiGridDropdownFilterDirective<T> extends UiGridFilter<T> implements OnDestroy {
    @Input()
    public items?: IDropdownOption[];

    @Input()
    public showAllOption = true;

    @Input()
    public value?: IDropdownOption;

    public updateValue(value?: IDropdownOption) {
        this.value = value;
    }

    ngOnDestroy() {
        this.filterChange.complete();
    }
}

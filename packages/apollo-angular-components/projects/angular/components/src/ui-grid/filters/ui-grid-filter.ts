import {
  EventEmitter,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';

import { IFilterModel } from '../models';

export abstract class UiGridFilter<T> implements OnDestroy {
    @Input()
    public disabled?: boolean;

    @Input()
    public method?: string;

    @Output()
    public filterChange = new EventEmitter<IFilterModel<T> | null>();

    ngOnDestroy() {
        this.filterChange.complete();
    }
}

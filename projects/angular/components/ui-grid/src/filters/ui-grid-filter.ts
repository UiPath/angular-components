import {
    Directive,
    EventEmitter,
    Input,
    OnDestroy,
    Output,
} from '@angular/core';

import { IFilterModel } from '../models';

/**
 * Filter definition directive.
 *
 * @export
 * @internal
 * @ignore
 */
@Directive()
export abstract class UiGridFilterDirective<T> implements OnDestroy {
    @Input()
    disabled?: boolean;

    @Input()
    method?: string;

    @Output()
    filterChange = new EventEmitter<IFilterModel<T> | null>();

    ngOnDestroy() {
        this.filterChange.complete();
    }
}

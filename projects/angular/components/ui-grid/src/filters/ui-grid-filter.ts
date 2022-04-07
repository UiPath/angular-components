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

    @Input()
    multipleOperator?: 'AND' | 'OR';

    @Input()
    multiple?: boolean;

    @Output()
    filterChange = new EventEmitter<IFilterModel<T> | IFilterModel<T>[] | null>();

    ngOnDestroy() {
        this.filterChange.complete();
    }
}

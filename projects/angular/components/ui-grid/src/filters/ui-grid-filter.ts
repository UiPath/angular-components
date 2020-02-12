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
    public disabled?: boolean;

    @Input()
    public method?: string;

    @Output()
    public filterChange = new EventEmitter<IFilterModel<T> | null>();

    ngOnDestroy() {
        this.filterChange.complete();
    }
}

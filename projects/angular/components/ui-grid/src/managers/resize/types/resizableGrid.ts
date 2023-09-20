import type {
    Observable,
    Subject,
} from 'rxjs';

import type {
    ChangeDetectorRef,
    ElementRef,
    EventEmitter,
    QueryList,
    SimpleChanges,
} from '@angular/core';

import type { UiGridColumnDirective } from '../../../body/ui-grid-column.directive';

/**
 * @internal
 * @ignore
 */
export abstract class ResizableGrid<T> {
    abstract columns: QueryList<UiGridColumnDirective<T>>;
    abstract rendered: EventEmitter<void>;
    abstract toggleColumns: boolean;
    abstract windowResize$: Observable<Event>;

    protected abstract _ref: ElementRef;
    protected abstract _cd: ChangeDetectorRef;

    protected abstract _destroyed$: Subject<void>;
    protected abstract _columnChanges$: Observable<SimpleChanges>;
}

import {
  ChangeDetectorRef,
  ElementRef,
  EventEmitter,
  QueryList,
  SimpleChanges,
} from '@angular/core';

import {
  Observable,
  Subject,
} from 'rxjs';

import { UiGridColumnDirective } from '../../../body';

export abstract class ResizableGrid<T> {
    public abstract columns:  QueryList<UiGridColumnDirective<T>>;
    public abstract rendered: EventEmitter<void>;

    protected abstract _ref: ElementRef;
    protected abstract _cd: ChangeDetectorRef;

    protected abstract _destroyed$: Subject<void>;
    protected abstract _columnChanges$: Observable<SimpleChanges>;
}

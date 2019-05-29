import {
  Directive,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { PageEvent } from '@angular/material/paginator';

import { tap } from 'rxjs/operators';

@Directive({
    selector: '[uiGridFooter], ui-grid-footer',
})
export class UiGridFooterDirective implements OnDestroy, OnInit {
    @Input()
    public length = 0;

    @Input()
    public set pageSize(value: number) {
        this._state.pageSize = value;
    }

    @Input()
    public pageSizes: number[] = [];

    @Input()
    public hidePageSize = false;

    @Output()
    public pageChange = new EventEmitter<PageEvent>();

    public get state() {
        return this._state;
    }

    private _state: PageEvent = { length: NaN, pageIndex: 0, pageSize: NaN, previousPageIndex: NaN };

    constructor() {
        this.pageChange.pipe(
            tap(ev => this._state = ev),
        ).subscribe();
    }

    ngOnInit() {
        this._state = { ...this._state, length: this.length };
    }

    ngOnDestroy() {
        this.pageChange.complete();
    }
}

import {
    Directive,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
} from '@angular/core';

import { tap } from 'rxjs/operators';

import { PageChangeEvent } from '../events/page-change-event';

/**
 * Footer definition directive.
 *
 * @export
 */
@Directive({
    selector: '[uiGridFooter], ui-grid-footer',
})
export class UiGridFooterDirective implements OnDestroy, OnInit {
    /**
     * The total item length.
     *
     */
    @Input()
    public length = 0;

    /**
     * The active page size.
     *
     */
    @Input()
    public set pageSize(value: number) {
        this._state.pageSize = value;
    }

    /**
     * The available page size options.
     *
     */
    @Input()
    public pageSizes: number[] = [];

    /**
     * If the page size options should be hidden.
     *
     */
    @Input()
    public hidePageSize = false;

    /**
     * Emits when the page is changed.
     *
     */
    @Output()
    public pageChange = new EventEmitter<PageChangeEvent>();

    /**
     * The current footer state.
     *
     */
    public get state() {
        return this._state;
    }

    private _state: PageChangeEvent = { length: NaN, pageIndex: 0, pageSize: NaN, previousPageIndex: NaN };

    /**
     * @ignore
     */
    constructor() {
        this.pageChange.pipe(
            tap(ev => this._state = ev),
        ).subscribe();
    }

    /**
     * @ignore
     */
    ngOnInit() {
        this._state = { ...this._state, length: this.length };
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.pageChange.complete();
    }
}

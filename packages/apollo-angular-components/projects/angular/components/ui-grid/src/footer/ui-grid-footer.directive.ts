import { tap } from 'rxjs/operators';

import {
    Directive,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
} from '@angular/core';

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
    length = 0;

    /**
     * The active page size.
     *
     */
    @Input()
    set pageSize(value: number) {
        this._state.pageSize = value;
    }

    /**
     * The active page index
     *
     */
    @Input()
    set pageIndex(value: number) {
        this._state.pageIndex = value;
    }

    /**
     * The available page size options.
     *
     */
    @Input()
    pageSizes: number[] = [];

    /**
     * If the page size options should be hidden.
     *
     */
    @Input()
    hidePageSize = false;

    /**
     * Emits when the page is changed.
     *
     */
    @Output()
    pageChange = new EventEmitter<PageChangeEvent>();

    /**
     * The current footer state.
     *
     */
    get state() {
        return this._state;
    }

    private _state: PageChangeEvent = {
        length: NaN,
        pageIndex: 0,
        pageSize: NaN,
        previousPageIndex: NaN,
    };

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
        this._state = {
            ...this._state,
            length: this.length,
        };
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.pageChange.complete();
    }
}

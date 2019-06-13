import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { DOCUMENT } from '@angular/common';
import {
    Directive,
    Inject,
    Input,
    OnDestroy,
    OnInit,
    Self,
} from '@angular/core';

import {
    fromEvent,
    merge,
    Subject,
} from 'rxjs';
import {
    debounceTime,
    delay,
    takeUntil,
    tap,
} from 'rxjs/operators';

/**
 * A directive that is designed to work alongside CdkVirtualScrollViewport
 * which triggers the viewport size check when the windows is resized
 * or when the input length is changed.
 *
 * @export
 */
@Directive({
    selector: '[uiVirtualScrollViewportResize], ui-virtual-scroll-viewport-resize',
})
export class UiVirtualScrollViewportResizeDirective implements OnInit, OnDestroy {
    private readonly _destroy$ = new Subject();
    private readonly _total$ = new Subject<number>();

    /**
     * The total item length.
     */
    @Input()
    public set total(value: number) {
        if (this._viewport.getDataLength() === value) { return; }

        this._total$.next(value);
    }

    /**
     * @ignore
     */
    constructor(
        @Self()
        @Inject(CdkVirtualScrollViewport)
        private readonly _viewport: CdkVirtualScrollViewport,
        @Inject(DOCUMENT)
        private readonly _document: any,
    ) { }

    /**
     * @ignore
     */
    ngOnInit() {
        merge(
            fromEvent(this._document.defaultView!, 'resize')
                .pipe(
                    debounceTime(1000 / 60),
                ),
            this._total$.pipe(
                delay(0),
            ),
        )
            .pipe(
                tap(() => this._viewport.checkViewportSize()),
                takeUntil(this._destroy$),
            )
            .subscribe();
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this._destroy$.next();
        this._destroy$.complete();
    }
}

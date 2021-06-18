import { Subject } from 'rxjs';

import { isDevMode } from '@angular/core';

/**
 * @internal
 * @ignore
 */
export class PerformanceMonitor {
    paintTime$ = new Subject<string>();

    get enabled() {
        return isDevMode();
    }

    private _timestamp?: number;
    private _obsever?: MutationObserver;

    constructor(element: Element) {
        if (!this.enabled) { return; }

        this._obsever = new MutationObserver(this._onPaint);
        this._obsever.observe(element, {
            childList: true,
            subtree: true,
        });
    }

    reset() {
        if (!this.enabled) { return; }

        this._timestamp = performance.now();
    }

    destroy() {
        this.paintTime$.complete();

        if (!this.enabled) { return; }

        this._obsever!.disconnect();
    }

    private _onPaint = (record: MutationRecord[]) => {
        const isRowPaint = record
            .some(r =>
                this._isRow(r.target) ||
                [
                    ...Array.from(r.addedNodes),
                    ...Array.from(r.removedNodes),
                ].some(this._isRow),
            );

        if (!isRowPaint) { return; }

        this.paintTime$.next((performance.now() - this._timestamp!).toFixed(2));
    };

    private _isRow = (element: Node) =>
        !!(element as Element).classList &&
        (element as Element)
            .classList
            .contains('ui-grid-row');
}

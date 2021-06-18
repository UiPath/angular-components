import { merge } from 'rxjs';
import { take } from 'rxjs/operators';
import scrollIntoViewIfNeeded, { Options } from 'scroll-into-view-if-needed';

import {
    Directive,
    ElementRef,
    Input,
    NgZone,
} from '@angular/core';

type Boundary = 'parent' | Element;

/**
 * A directive that scrolls an element into view.
 * Depends On: [scroll-into-view-if-needed](https://www.npmjs.com/package/scroll-into-view-if-needed)
 *
 * The browser APIs available for scrolling to an element are very primitive, scrolls on the parents as well as the child.
 * This behavior results in weird jumps in certain scenarios, using `scroll-into-view-if-needed` helps avoid this issue.
 *
 * `scroll-into-view-if-needed` allows us to better control the scroll `boundary` and much more.
 *
 * @export
 */
@Directive({
    selector: '[uiScrollIntoView]',
})
export class UiScrollIntoViewDirective {
    /**
     * The boundary of the `scroll` effect.
     *
     */
    @Input()
    boundary: Boundary = 'parent';

    @Input()
    block: Options['block'] = 'start';

    /**
     * Configures if the decorated element should be scrolled into view.
     * eg: `[uiScrollIntoView]="isFocused"`
     *
     */
    @Input()
    set uiScrollIntoView(condition: boolean) {
        this._zone.runOutsideAngular(() => {
            if (!condition) { return; }
            merge(
                this._zone.onMicrotaskEmpty,
                this._zone.onStable,
            ).
                pipe(
                    take(1),
                ).subscribe(() => {
                    this.scrollIntoViewIfNeeded(
                        this._element.nativeElement, {
                        block: this.block,
                        boundary: this.boundary === 'parent' ?
                            this._element.nativeElement.parentElement :
                            this.boundary,
                    },
                    );
                });
        });
    }

    /**
     * Method that scrolls to the the provided `target`.
     *
     */
    scrollIntoViewIfNeeded = scrollIntoViewIfNeeded;

    /**
     * @ignore
     */
    constructor(
        private _element: ElementRef,
        private _zone: NgZone,
    ) { }
}

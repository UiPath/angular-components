import { InteractivityChecker } from '@angular/cdk/a11y';
import {
    ChangeDetectorRef,
    Directive,
    ElementRef,
    Input,
    NgZone,
    OnInit,
} from '@angular/core';

import { merge } from 'rxjs';
import {
    delay,
    take,
} from 'rxjs/operators';

/**
 * @ignore
 */
const ELEMENT_NODE = 1;

/**
 * A directive that autofocuses the decorated element OR the first focusable element inside the decorated element.
 *
 * @export
 */
@Directive({
    selector: '[uiAutofocus]',
})
export class UiAutofocusDirective implements OnInit {
    /**
     * Configure if the element should be focused.
     * Defaults to: `true`
     *
     */
    @Input()
    set uiAutofocus(condition: boolean) {
        this._autofocus = condition;
    }

    /**
     * Set to `true` if the element needs to be refocused.
     * eg: `[refocus]="refocu$ | async"`
     *
     */
    @Input()
    set refocus(condition: boolean) {
        if (condition) {
            this.enqueueFocus();
        }
    }

    /**
     * Where the selection location should be after the element is focused.
     *
     */
    @Input()
    public selectionLocation: 'start' | 'end' = 'start';

    /**
     * The decorated `HTMLElement` reference.
     *
     */
    public element?: HTMLElement;

    private _autofocus = true;

    /**
    * @ignore
    */
    constructor(
        private _el: ElementRef,
        private _zone: NgZone,
        private _cd: ChangeDetectorRef,
        private _checker: InteractivityChecker,
    ) { }

    /**
     * @ignore
     */
    ngOnInit() {
        this.enqueueFocus();
    }

    /**
     * Enqueues a focus event.
     *
     */
    public enqueueFocus() {
        if (this._autofocus) {
            this._zone.runOutsideAngular(() => {
                merge(
                    this._zone.onMicrotaskEmpty,
                    // IE doesn't play nicely with task empty only
                    this._zone.onStable,
                )
                    .pipe(
                        take(1),
                        /* PREVENTS FOCUS TRAPS */
                        delay(0),
                    )
                    .subscribe(() => {
                        if (!this.element) {
                            this.element = this._getFocusableNode(this._el.nativeElement);
                        }
                        this.focus(this.element);
                    });
            });
        }
    }

    /**
     * Focus the `element`.
     *
     */
    public focus(element?: HTMLElement) {
        if (!element) { return; }
        element.focus();

        if (this._el.nativeElement instanceof HTMLInputElement) {
            const position = this.selectionLocation === 'start' ?
                0 :
                this._el.nativeElement.value.length;

            this._el.nativeElement.setSelectionRange(
                position,
                position,
            );
        }

        this._cd.detectChanges();
    }

    private _getFocusableNode(el: HTMLElement): HTMLElement | undefined {
        if (this._checker.isFocusable(el)) {
            return el;
        }

        const children = el.children || el.childNodes;

        for (let i = 0; i < children.length; i++) {
            const focusable = children[i].nodeType === ELEMENT_NODE ?
                this._getFocusableNode(children[i] as HTMLElement) :
                null;

            if (focusable) {
                return focusable;
            }
        }
    }
}

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

const ELEMENT_NODE = 1;

@Directive({
    selector: '[uiAutofocus]',
})
export class UiAutofocusDirective implements OnInit {
    @Input()
    set uiAutofocus(condition: boolean) {
        this._autofocus = condition;
    }

    @Input()
    set refocus(condition: boolean) {
        if (condition) {
            this.queueFocus();
        }
    }

    @Input()
    public selectionLocation: 'start' | 'end' = 'start';

    public element?: HTMLElement;

    private _autofocus = true;

    constructor(
        private _el: ElementRef,
        private _zone: NgZone,
        private _cd: ChangeDetectorRef,
        private _checker: InteractivityChecker,
    ) { }

    ngOnInit() {
        this.queueFocus();
    }

    public queueFocus() {
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

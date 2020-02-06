import {
    Directive,
    ElementRef,
    OnChanges,
    OnDestroy,
    Renderer2,
} from '@angular/core';

import { Subject } from 'rxjs';

@Directive()
export abstract class UiFormatDirective implements OnChanges, OnDestroy {
    protected abstract _text?: HTMLElement;
    protected _redraw$ = new Subject();
    protected _destroyed$ = new Subject();

    constructor(
        protected _renderer: Renderer2,
        protected _elementRef: ElementRef,
    ) { }

    ngOnChanges() {
        this._redraw$.next();
    }

    ngOnDestroy() {
        if (this._text) {
            this._renderer.removeChild(this._elementRef.nativeElement, this._text);
        }
        this._destroyed$.next();
    }
}

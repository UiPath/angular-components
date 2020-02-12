import {
    Directive,
    Input,
    TemplateRef,
    ViewContainerRef,
} from '@angular/core';

/**
 * @ignore
 */
class NgLetContext {
    $implicit: any = null;
    ngLet: any = null;
}

/**
 * A directive that allows declaration of streams inside the `template`.
 * Similar to `*ngIf="source$ | async as source"`.
 * `NgLet` works the same way, the difference being that the content is rendered,
 * even if the source has not yet been initialized.
 *
 * @export
 */
@Directive({
    // tslint:disable-next-line: directive-selector
    selector: '[ngLet]',
})
export class UiNgLetDirective {
    private _context = new NgLetContext();

    /**
     * The context bound to the decorated area.
     *
     */
    @Input()
    set ngLet(value: any) {
        this._context.$implicit = this._context.ngLet = value;
    }

    /**
     * @ignore
     */
    constructor(
        private _vcr: ViewContainerRef,
        private _templateRef: TemplateRef<NgLetContext>,
    ) {
        this._vcr.createEmbeddedView(
            this._templateRef,
            this._context,
        );
    }
}

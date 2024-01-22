import {
    Directive,
    Input,
    TemplateRef,
    ViewContainerRef,
} from '@angular/core';

/**
 * @ignore
 */
class NgLetContext<T = unknown> {
    $implicit: T = null!;
    ngLet: T = null!;
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
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: '[ngLet]',
})
export class UiNgLetDirective<T = unknown> {
    private _context = new NgLetContext<T>();

    /**
     * The context bound to the decorated area.
     *
     */
    @Input()
    set ngLet(value: T) {
        this._context.$implicit = this._context.ngLet = value;
    }

    /**
     * @ignore
     */
    constructor(
        private _vcr: ViewContainerRef,
        private _templateRef: TemplateRef<NgLetContext<T>>,
    ) {
        this._vcr.createEmbeddedView(
            this._templateRef,
            this._context,
        );
    }

    static ngTemplateContextGuard<T>(_dir: UiNgLetDirective<T>, _ctx: unknown): _ctx is NgLetContext<T> {
        return true;
    }

}

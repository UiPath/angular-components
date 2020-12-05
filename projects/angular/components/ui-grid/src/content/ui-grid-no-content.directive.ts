import {
    ContentChild,
    Directive,
    TemplateRef,
} from '@angular/core';

/**
 * No content template directive.
 *
 * @export
 */
@Directive({
    selector: '[uiNoContent], ui-no-content',
})
export class UiGridNoContentDirective {
    /**
     * @internal
     * @ignore
     */
    @ContentChild(TemplateRef, {
        static: true,
    })
    public html?: TemplateRef<any>;
}

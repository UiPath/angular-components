import {
    ContentChild,
    Directive,
    TemplateRef,
} from '@angular/core';

@Directive({
    selector: '[uiGridNoContent], ui-grid-no-content',
})
export class UiGridNoContentDirective {
    @ContentChild(TemplateRef, {
        static: true,
    })
    public html?: TemplateRef<any>;
}

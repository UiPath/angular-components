import {
    ContentChild,
    Directive,
    TemplateRef,
} from '@angular/core';

@Directive({
    selector: '[uiGridCustomSearch], ui-grid-custom-search',
})
export class UiGridCustomSearchDirective {
    @ContentChild(TemplateRef, {
        static: true,
    })
    html?: TemplateRef<any>;
}

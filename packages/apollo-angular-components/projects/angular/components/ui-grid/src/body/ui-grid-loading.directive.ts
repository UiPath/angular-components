import {
    ContentChild,
    Directive,
    TemplateRef,
} from '@angular/core';

@Directive({
    selector: '[uiGridLoading], ui-grid-loading',
})
export class UiGridLoadingDirective {
    @ContentChild(TemplateRef, {
        static: true,
    })
    html?: TemplateRef<any>;
}

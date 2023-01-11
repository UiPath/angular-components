import {
    ContentChild,
 Directive, TemplateRef,
} from '@angular/core';

export interface IGridRowCardViewContext {
    index: number;
    last: boolean;
    data: any;
}

@Directive({ selector: '[uiGridRowCardView], ui-grid-row-card-view' })
export class UiGridRowCardViewDirective {
    @ContentChild(TemplateRef, {
        static: true,
    })
    html?: TemplateRef<IGridRowCardViewContext>;
}

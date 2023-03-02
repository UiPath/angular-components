import {
    ContentChild,
 Directive, TemplateRef,
} from '@angular/core';

export interface IGridRowCardViewContext<T> {
    index: number;
    last: boolean;
    data: T;
}

@Directive({ selector: '[uiGridRowCardView], ui-grid-row-card-view' })
export class UiGridRowCardViewDirective<T> {
    @ContentChild(TemplateRef, {
        static: true,
    })
    html?: TemplateRef<IGridRowCardViewContext<T>>;
}

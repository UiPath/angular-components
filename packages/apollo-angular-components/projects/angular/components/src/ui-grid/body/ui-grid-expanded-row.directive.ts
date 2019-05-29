import {
  ContentChild,
  Directive,
  TemplateRef,
} from '@angular/core';

@Directive({
    selector: '[uiGridExpandedRow], ui-grid-expanded-row',
})
export class UiGridExpandedRowDirective {
    @ContentChild(TemplateRef) html?: TemplateRef<any>;
}

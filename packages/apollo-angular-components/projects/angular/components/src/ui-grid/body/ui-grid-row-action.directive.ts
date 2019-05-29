import {
  ContentChild,
  Directive,
  TemplateRef,
} from '@angular/core';

@Directive({
    selector: '[uiGridRowAction], ui-grid-row-action',
})
export class UiGridRowActionDirective {
    @ContentChild(TemplateRef) html?: TemplateRef<any>;
}

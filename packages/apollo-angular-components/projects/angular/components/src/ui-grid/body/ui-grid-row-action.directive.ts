import {
    ContentChild,
    Directive,
    TemplateRef,
} from '@angular/core';

/**
 * The row action definition directive.
 *
 */
@Directive({
    selector: '[uiGridRowAction], ui-grid-row-action',
})
export class UiGridRowActionDirective {
  /**
   * @ignore
   */
  @ContentChild(TemplateRef, {
      static: true,
  })
    public html?: TemplateRef<any>;
}

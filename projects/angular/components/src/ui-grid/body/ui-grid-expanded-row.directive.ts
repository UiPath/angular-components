import {
  ContentChild,
  Directive,
  TemplateRef,
} from '@angular/core';

/**
 * Expanded row definition directive.
 *
 * @export
 */
@Directive({
  selector: '[uiGridExpandedRow], ui-grid-expanded-row',
})
export class UiGridExpandedRowDirective {
  /**
   * @internal
   * @ignore
   */
  @ContentChild(TemplateRef) html?: TemplateRef<any>;
}

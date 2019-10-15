import {
    ContentChild,
    Directive,
    Input,
    TemplateRef,
} from '@angular/core';

/**
 * Header button definition directive.
 *
 * @export
 */
@Directive({
    selector: '[uiHeaderButton], ui-header-button',
})
export class UiGridHeaderButtonDirective {
  /**
   * Configure if the button is the grid main action, or a selection action.
   *
   */
  @Input()
    public type?: 'action' | 'main' | 'inline';

  /**
   * Configure if the button is visible or not.
   *
   */
  @Input()
  public visible = true;

  /**
   * @internal
   * @ignore
   */
  @ContentChild(TemplateRef, {
      static: true,
  })
  public html?: TemplateRef<any>;
}

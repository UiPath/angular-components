import {
  ContentChild,
  Directive,
  Input,
  TemplateRef,
} from '@angular/core';

@Directive({
    selector: '[uiHeaderButton], ui-header-button',
})
export class UiGridHeaderButtonDirective {
    @Input()
    public type?: 'action' | 'main';

    @Input()
    public visible = true;

    @ContentChild(TemplateRef)
    public html?: TemplateRef<any>;
}

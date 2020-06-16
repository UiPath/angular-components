import {
    Directive,
    ElementRef,
    HostBinding,
    Input,
    Optional,
} from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';

export const DISABLE_AUTO_ACCESSIBLE_LABEL_ATTRIBUTE = 'disable-auto-accessible-label';

// tslint:disable: max-line-length
export const MAT_TOOLTIP_MISSING_WARNING = `
[A11Y]: icon button doesn't have a MatTooltip.

An icon button should have a tooltip to clarify it's purpose. The tooltip's content is shown on mouse and keyboard hover and, for assistive technology users, it is used as the button's label.
You can disable this directive using the boolean ${DISABLE_AUTO_ACCESSIBLE_LABEL_ATTRIBUTE} attribute in case you need more control over the button's accessible label.
`.trim();
// tslint:enable: max-line-length

@Directive({
    // tslint:disable-next-line: directive-selector
    selector: ` [mat-fab]:not([${DISABLE_AUTO_ACCESSIBLE_LABEL_ATTRIBUTE}]),
                [mat-mini-fab]:not([${DISABLE_AUTO_ACCESSIBLE_LABEL_ATTRIBUTE}]),
                [mat-icon-button]:not([${DISABLE_AUTO_ACCESSIBLE_LABEL_ATTRIBUTE}])`,
})
export class UiAutoAccessibleLabelDirective {
    @HostBinding('attr.aria-label')
    @Input()
    public matTooltip?: string;

    constructor(
        elementRef: ElementRef,
        @Optional() tooltip?: MatTooltip,
    ) {
        if (!tooltip) {
            console.warn(MAT_TOOLTIP_MISSING_WARNING, elementRef.nativeElement);
        }
    }
}

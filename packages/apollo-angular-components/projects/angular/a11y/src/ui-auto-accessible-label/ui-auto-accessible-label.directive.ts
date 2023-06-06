import {
    Directive,
    ElementRef,
    HostBinding,
    Input,
    OnChanges,
    Optional,
    SimpleChanges,
} from '@angular/core';
import { MatLegacyTooltip as MatTooltip } from '@angular/material/legacy-tooltip';

export const DISABLE_AUTO_ACCESSIBLE_LABEL_ATTRIBUTE = 'disable-auto-accessible-label';

/* eslint-disable max-len */
export const MAT_TOOLTIP_MISSING_WARNING = `
[A11Y]: icon button doesn't have a MatTooltip.

An icon button should have a tooltip to clarify it's purpose. The tooltip's content is shown on mouse and keyboard hover and, for assistive technology users, it is used as the button's label.
You can disable this directive using the boolean ${DISABLE_AUTO_ACCESSIBLE_LABEL_ATTRIBUTE} attribute in case you need more control over the button's accessible label.
`.trim();
/* eslint-enable max-len */

@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: ` [mat-fab]:not([${DISABLE_AUTO_ACCESSIBLE_LABEL_ATTRIBUTE}]),
                [mat-mini-fab]:not([${DISABLE_AUTO_ACCESSIBLE_LABEL_ATTRIBUTE}]),
                [mat-icon-button]:not([${DISABLE_AUTO_ACCESSIBLE_LABEL_ATTRIBUTE}]),
                mat-icon:not([${DISABLE_AUTO_ACCESSIBLE_LABEL_ATTRIBUTE}])`,
})
export class UiAutoAccessibleLabelDirective implements OnChanges {
    @HostBinding('attr.aria-label')
    @Input()
    matTooltip?: string;

    constructor(
        private _elementRef: ElementRef<HTMLUnknownElement>,
        @Optional() tooltip?: MatTooltip,
    ) {
        if (!tooltip && _elementRef.nativeElement.tabIndex !== -1) {
            console.warn(MAT_TOOLTIP_MISSING_WARNING, _elementRef.nativeElement);
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.matTooltip) {
            const element = this._elementRef.nativeElement;
            if (
                element.tagName === 'MAT-ICON'
                && !!changes.matTooltip.currentValue
                && element.tabIndex === -1
            ) {
                element.tabIndex = 0;
            }
        }
    }
}

import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { UiSuggestComponent } from '../ui-suggest.component';

export class UiSuggestAssert {
    constructor(
        private _root: DebugElement,
        private _suggest: UiSuggestComponent,
    ) { }

    isOpen(): void {
        this._assertOpenState('open');
    }

    isClosed(): void {
        this._assertOpenState('closed');
    }

    isDisabled(): void {
        this._assertDisableState('disabled');
    }

    isEnabled(): void {
        this._assertDisableState('enabled');
    }

    private _assertOpenState(expected: 'open' | 'closed'): void {
        const expectedIsOpen = expected === 'open';

        expect(this._suggest.isOpen).toBe(expectedIsOpen);

        if (!this._suggest.multiple) {
            const combo = this._root.query(By.css('[role=combobox]')).nativeElement;
            expect(combo).toHaveAttr('aria-expanded', expectedIsOpen.toString());
        }

        const dropdownOverlay = document.querySelector('.cdk-overlay-container');
        const itemList = dropdownOverlay?.querySelector('.ui-suggest-dropdown-item-list-container');
        expect(!!itemList).toBe(expectedIsOpen);
    }

    private _assertDisableState(expected: 'enabled' | 'disabled'): void {
        const expectedIsDisabled = expected === 'disabled';

        expect(this._suggest.disabled).toBe(expectedIsDisabled);

        const combo = this._root.query(By.css('[role=combobox]')).nativeElement;
        expect(combo).toHaveAttr('aria-disabled', expectedIsDisabled.toString());
    }
}

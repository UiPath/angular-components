import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { UiSuggestComponent } from '../ui-suggest.component';

export class UiSuggestAssert {
    public constructor(private _root: DebugElement, private _suggest: UiSuggestComponent) {
    }

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

    private _assertOpenState(expected: 'open' | 'closed') {
        const expectedIsOpen = expected === 'open';

        expect(this._suggest.isOpen).toBe(expectedIsOpen);

        const combo = this._root.query(By.css('[role=combobox]')).nativeElement;
        expect(combo).toHaveAttr('aria-expanded', expectedIsOpen.toString());

        const itemList = this._root.query(By.css('.item-list-container'));
        const itemListClasses = itemList.nativeElement.classList;
        expect(itemListClasses.contains('item-list-container-state-open')).toBe(expectedIsOpen);
        expect(itemListClasses.contains('item-list-container-state-closed')).toBe(!expectedIsOpen);
    }

    private _assertDisableState(expected: 'enabled' | 'disabled') {
        const expectedIsDisabled = expected === 'disabled';

        expect(this._suggest.disabled).toBe(expectedIsDisabled);

        const combo = this._root.query(By.css('[role=combobox]')).nativeElement;
        expect(combo).toHaveAttr('aria-disabled', expectedIsDisabled.toString());
    }
}

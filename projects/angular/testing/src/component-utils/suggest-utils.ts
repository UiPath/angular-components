import { HttpTestingController } from '@angular/common/http/testing';
import { DebugElement } from '@angular/core';
import { tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UiSuggestComponent } from '@uipath/angular/components/ui-suggest';
import {
    EventGenerator,
    Key,
} from '@uipath/angular/testing';

import {
    FixtureTestingUtils,
    IStubEndpoint,
} from '../utilities/fixture-testing-utils';

export const SUGGEST_DEBOUNCE = 400;

export class SuggestUtils<T> {
    dropdownSelector = '.ui-suggest-dropdown-item-list-container';

    constructor(
        private _utils: FixtureTestingUtils<T>,
    ) { }

    openAndFlush = (selector: string, httpRequest: (...args: any[]) => any) => {
        this._utils.click('.display', this._utils.getDebugElement(selector));
        this._utils.fixture.detectChanges();
        httpRequest();
        this._utils.fixture.detectChanges();
    };

    // eslint-disable-next-line complexity
    searchAndSelect = (selector: string, httpRequest?: (...args: any[]) => any, searchStr = '', nth = 0, debugEl?: DebugElement) => {
        const suggest = this._utils.getDebugElement(selector, debugEl);
        const multiple = this.isMultiple(selector);
        const strategy = this.getFetchStrategy(selector, debugEl);

        if (!multiple && !this.isOpen(selector)) {
            this._utils.fixture.detectChanges();

            this._utils.click('.display', suggest);
            this._utils.fixture.detectChanges();

            if (
                httpRequest &&
                strategy === 'onOpen'
                // if we're searching for some specific string, the first query can be ignored,
                // hint: use `openAndFlush()`
                && searchStr !== ''
            ) {
                tick(1000);
                this._utils.fixture.detectChanges();
                httpRequest();
            }
        }

        const suggestDropdown = this._utils.getDebugElement(this.dropdownSelector, debugEl);
        const parentContainer = multiple ? suggest : suggestDropdown;
        const searchInput = this._utils.getDebugElement('input', parentContainer);

        if (searchInput) { // && searchStr
            if (multiple && !this.isOpen(selector)) {
                searchInput.nativeElement.dispatchEvent(EventGenerator.click);
                this._utils.fixture.detectChanges();

                if (httpRequest && strategy === 'onOpen') {
                    tick(1000);
                    this._utils.fixture.detectChanges();
                    httpRequest();
                }
            }

            this._utils.setInput('input', searchStr, parentContainer);
            tick(SUGGEST_DEBOUNCE);
            this._utils.fixture.detectChanges();

            if (httpRequest) { httpRequest(); }
        }

        tick(100);
        this._utils.fixture.detectChanges();

        const listItems = parentContainer.queryAll(By.css('.mat-list-item'));

        const reverseOrder = !!parentContainer.query(By.css('mat-list:first-child:not(:only-child)'));

        const listItem = listItems[reverseOrder ? listItems.length - nth - 1 : nth].nativeElement;
        listItem.dispatchEvent(EventGenerator.click);
        this._utils.fixture.detectChanges();

        if (multiple) {
            this._utils.getNativeElement(`.mat-chip-list`, suggest)!
                .dispatchEvent(EventGenerator.keyUp(Key.Escape));
            this._utils.fixture.detectChanges();
        }
    };

    getFetchStrategy = (selector: string, debugEl?: DebugElement) => {
        const suggest = this._utils.getDebugElement(selector, debugEl);
        // maybe add a getter along the setter for fetchStrategy ?
        // eslint-disable-next-line @typescript-eslint/dot-notation
        return (suggest.componentInstance as UiSuggestComponent)['_fetchStrategy$']?.value ?? 'eager';
    };

    selectNthItem = (selector: string, nth = 0, config?: {
        httpMock: HttpTestingController;
        stub: IStubEndpoint;
    }, debugEl?: DebugElement) => {
        const suggest = this._utils.getDebugElement(selector, debugEl);
        const multiple = this.isMultiple(selector);

        if (!this.isOpen(selector)) {
            this._utils.click(multiple ? 'input' : '.display', suggest);
            this._utils.fixture.detectChanges();
        }

        const strategy = this.getFetchStrategy(selector, debugEl);

        if (!!config && strategy === 'onOpen') {
            tick(1000);
            this._utils.expectAndFlush(config.stub, config.httpMock);
        }

        tick(100);
        this._utils.fixture.detectChanges();

        const suggestDropdown = this._utils.getDebugElement(this.dropdownSelector, debugEl);

        const listItems = suggestDropdown.queryAll(By.css('.mat-list-item'));

        const reverseOrder = !!suggestDropdown.query(By.css('mat-list:first-child:not(:only-child)'));

        const listItem = listItems[reverseOrder ? listItems.length - nth - 1 : nth].nativeElement;

        listItem.dispatchEvent(EventGenerator.click);
        this._utils.fixture.detectChanges();
        tick(1000);

        if (!!config && strategy === 'eager') {
            this._utils.expectAndFlush(config.stub, config.httpMock);
        }

        return listItem;
    };

    isMultiple = (selector: string, debugEl?: DebugElement) => !!this._utils.getNativeElement(`${selector} mat-chip-list`, debugEl);

    isOpen = (selector: string, debugEl?: DebugElement) => !!this._utils.getNativeElement(`${selector} [aria-expanded="true"]`, debugEl);

    getValue = (selector: string, debugEl = this._utils.fixture.debugElement) => {
        if (this.isMultiple(selector)) {
            return this._utils.getAllNativeElements(`${selector} .mat-chip span`, debugEl)
                .map(el => el.innerText.trim())
                .join(',');
        }

        return this._utils.getNativeElement(`${selector} .display-value`, debugEl)!
            .innerText
            .trim();
    };

    clear = (selector: string) =>
        this._utils.getNativeElement(`${selector} [role=button].mat-icon`)?.dispatchEvent(EventGenerator.click);
}

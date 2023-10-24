import { HttpTestingController } from '@angular/common/http/testing';
import { DebugElement } from '@angular/core';
import { tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UiSuggestComponent } from '@uipath/angular/components/ui-suggest';
import {
    EventGenerator,
    Key,
} from '@uipath/angular/testing';

import { SUGGEST_DEBOUNCE } from './constants';

export class SuggestUtils<T> {
    dropdownSelector = '.ui-suggest-dropdown-item-list-container';

    constructor(
        private _utils: IntegrationUtils<T>,
    ) { }

    openAndFlush = (selector: string, httpRequest: Function) => {
        this._utils.click('.display', this._utils.getDebugElement(selector));
        this._utils.fixture.detectChanges();
        httpRequest();
        this._utils.fixture.detectChanges();
    };

    // eslint-disable-next-line complexity
    searchAndSelect = (selector: string, httpRequest?: Function, searchStr = '', nth = 0, debugEl?: DebugElement) => {
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
        return (suggest.componentInstance as UiSuggestComponent)._fetchStrategy$?.value ?? 'eager';
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

class KVPUtils<T> {
    constructor(
        private _utils: IntegrationUtils<T>,
    ) { }

    /**
     * Creates a new key value pair and populates it with the specified values
     *
     * @param keySearchText key suggest text to be selected
     * @param valueSearchText value suggest text to be selected
     */
    addAndPopulateKVPInput = (keySearchText: string, valueSearchText: string, keyHttpRequest?: Function, valueHttpRequest?: Function) => {
        this._utils.click('[data-cy=ui-kvp-add-new-entry]');
        this._utils.fixture.detectChanges();

        this._utils.suggest.searchAndSelect(this._nthKeySuggestSelector(0), keyHttpRequest, keySearchText);
        this._utils.fixture.detectChanges();
        tick(1000);
        this._utils.fixture.detectChanges();

        this._utils.suggest.searchAndSelect(this._nthValueSuggestSelector(0), valueHttpRequest, valueSearchText);
        this._utils.fixture.detectChanges();
        tick(1);
        this._utils.fixture.detectChanges();

        tick(1000);
        this._utils.fixture.detectChanges();
    };

    /**
     * Existing number of key value pairs.
     *
     * @param debugEl
     * @returns
     */
    currentKVPCount(debugEl = this._utils.fixture.debugElement) {
        const selector = 'ui-key-value-input';
        return this._utils.getAllDebugElements(selector, debugEl).length;
    }

    /**
     * Retrive a reference to the nth key suggest.
     * Index starts at 1.
     *
     * @param debugEl
     * @returns
     */
    nthKeySuggest(index: number, debugEl = this._utils.fixture.debugElement) {
        const selector = this._nthKeySuggestSelector(index);
        return this._utils.getDebugElement(selector, debugEl);
    }

    /**
     * Retrive a reference to the nth value suggest.
     * Index starts at 1.
     *
     * @param debugEl
     * @returns
     */
    nthValueSuggest(index: number, debugEl = this._utils.fixture.debugElement) {
        const selector = this._nthValueSuggestSelector(index);
        return this._utils.getDebugElement(selector, debugEl);
    }

    /**
     * Removes the nth key value pair.
     * Index starts at 1.
     *
     * @param debugEl
     * @returns
     */
    removeNthKVP(index: number, debugEl = this._utils.fixture.debugElement) {
        const selector = this._nthRemoveButtonSelector(index);
        this._utils.click(selector, debugEl);

        tick(1000);
        this._utils.fixture.detectChanges();
    }

    private _nthKeySuggestSelector(index: number) { return `[data-cy=ui-kvp-input-nr-${index}] [data-cy=ui-kvp-key-suggest]`; }
    private _nthValueSuggestSelector(index: number) { return `[data-cy=ui-kvp-input-nr-${index}] [data-cy=ui-kvp-value-suggest]`; }
    private _nthRemoveButtonSelector(index: number) { return `[data-cy=ui-kvp-input-nr-${index}] [data-cy=ui-kvp-remove-button]`; }
}

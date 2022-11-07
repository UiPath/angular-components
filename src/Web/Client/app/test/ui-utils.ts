import { HttpTestingController } from '@angular/common/http/testing';
import {
    DebugElement,
    Type,
} from '@angular/core';
import {
    ComponentFixture,
    discardPeriodicTasks,
    flush,
    tick,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UiSuggestComponent } from '@uipath/angular/components/ui-suggest';
import {
    EventGenerator,
    Key,
} from '@uipath/angular/testing';

import { SUGGEST_DEBOUNCE } from './constants';

export interface IStubEndpoint {
    url: string;
    response: any;
}

const selectors = {
    grid: 'ui-grid',
    inlineMenu: '[data-cy="grid-action-menu"]',
};

export class IntegrationUtils<T> {
    public get component() {
        return this.fixture.componentInstance;
    }

    public grid = new GridUtils<T>(this);
    public suggest = new SuggestUtils<T>(this);
    public kvpUtils = new KVPUtils<T>(this);
    public uiUtils = new UIUtils(this.fixture.nativeElement);

    constructor(
        public fixture: ComponentFixture<T>,
    ) { }

    public getDebugElement = (selector: string, debugEl = this.fixture.debugElement) =>
        debugEl.query(By.css(selector));

    public getAllDebugElements = (selector: string, debugEl = this.fixture.debugElement) =>
        debugEl.queryAll(By.css(selector));

    public getChildComponentInstance = (type: Type<any>, debugEl = this.fixture.debugElement) =>
        debugEl.query(By.directive(type))?.componentInstance;

    public getAllChildComponentInstances = (type: Type<any>, debugEl = this.fixture.debugElement) =>
        debugEl.queryAll(By.directive(type)).map(el => el.componentInstance);

    public getNativeElement = <U extends HTMLElement>(selector: string, debugEl = this.fixture.debugElement) => {
        const debugElement = this.getDebugElement(selector, debugEl);
        return debugElement ? debugElement.nativeElement as U : null;
    };

    public getAllNativeElements = <U extends HTMLElement>(selector: string, debugEl = this.fixture.debugElement) => {
        const debugElements = this.getAllDebugElements(selector, debugEl);
        return debugElements.map(e => e.nativeElement as U);
    };

    public getComponent = (selector: string, debugEl = this.fixture.debugElement) => {
        const debugElement = this.getDebugElement(selector, debugEl);
        return debugElement ? debugElement.componentInstance : null;
    };

    public switchToTab = async (number: number, debugEl = this.fixture.debugElement) => {
        const tab = this.getDebugElement(`.mat-tab-label:nth-of-type(${number}) .mat-tab-label-content`, debugEl);
        tab.nativeElement.dispatchEvent(EventGenerator.click);
        this.fixture.detectChanges();
        await this.fixture.whenRenderingDone();
        this.fixture.detectChanges();
    };

    public click = (selector: string, debugEl = this.fixture.debugElement) =>
        this.getNativeElement(selector, debugEl)!
            .dispatchEvent(EventGenerator.click);

    public clickRadioButton = (selector: string, debugEl = this.fixture.debugElement) =>
        this.click(`${selector} .mat-radio-label`, debugEl);

    public enter = (selector: string, debugEl = this.fixture.debugElement) =>
        this.getNativeElement(selector, debugEl)!
            .dispatchEvent(EventGenerator.keyDown(Key.Enter));

    public expectAndFlush = (stub: IStubEndpoint, httpClient: HttpTestingController, params: Record<string, string> = {}) => {
        const urlWithParams = stub.url.includes('?');

        const testReq = httpClient.expectOne(request => {
            const urlMatch = request[urlWithParams ? 'urlWithParams' : 'url'].includes(stub.url);

            const paramMatch = Object.entries(params).every(([key, value]) => request.params.get(key) === value);
            return urlMatch && paramMatch;
        });
        if (stub.response instanceof ErrorEvent) {
            testReq.error(stub.response);
        } else {
            testReq.flush(stub.response);
        }

        return testReq;
    };

    public flushDiscardAndDetect = (times = 1) => {
        new Array(times).fill(0).forEach(() => {
            flush();
            discardPeriodicTasks();
            this.fixture.detectChanges();
        });
    };

    public setInput = (selector: string, value: any, debugEl = this.fixture.debugElement) => {
        const input = this.uiUtils.setInput(selector, value, debugEl.nativeElement);
        this.fixture.detectChanges();
        return input;
    };

    public changeInput = (selector: string, value: any, debugEl = this.fixture.debugElement) => {
        const input = this.uiUtils.changeInput(selector, value, debugEl.nativeElement);
        this.fixture.detectChanges();
        return input;
    };

    public isCheckboxChecked = (selector: string, debugEl = this.fixture.debugElement) =>
        this.getDebugElement(selector, debugEl)
            .nativeElement
            .classList
            .contains('mat-checkbox-checked');

    public isCheckboxIndeterminate = (selector: string, debugEl = this.fixture.debugElement) =>
        this.getDebugElement(selector, debugEl)
            .nativeElement
            .classList
            .contains('mat-checkbox-indeterminate');

    public toggleCheckbox = (selector: string, debugEl = this.fixture.debugElement) =>
        this.getDebugElement(selector, debugEl)
            .query(By.css('.mat-checkbox-label'))
            .nativeElement
            .dispatchEvent(EventGenerator.click);

    public setCheckboxState = (selector: string, state: boolean, debugEl = this.fixture.debugElement) => {
        const isChecked = this.isCheckboxChecked(selector, debugEl);
        if (
            !isChecked && state ||
            isChecked && !state
        ) {
            this.toggleCheckbox(selector);
        }
    };

    public toggleSlider = (selector: string, debugEl = this.fixture.debugElement) =>
        this.uiUtils.toggleSlider(selector, debugEl.nativeElement);

    public setSliderState(selector: string, state: boolean, debugEl = this.fixture.debugElement) {
        const isToggled = this.isToggleChecked(selector, debugEl);
        if (
            isToggled && !state ||
            !isToggled && state
        ) {
            debugEl.query(By.css(`${selector} input[type=checkbox]`)).nativeElement.click();
        }
    }

    public isToggleChecked = (selector: string, debugEl = this.fixture.debugElement) =>
        this.uiUtils.isToggleChecked(selector, debugEl.nativeElement);

    public isRadioButtonChecked = (selector: string, debugEl = this.fixture.debugElement) =>
        this.getDebugElement(selector, debugEl)
            .nativeElement
            .classList
            .contains('mat-radio-checked');

    public isRadioGroupDisabled = (selector: string, debugEl = this.fixture.debugElement) =>
        this.getDebugElement(selector, debugEl)
            .queryAll(By.css('mat-radio-button'))
            .every((elem) => this._isRadioButtonElementDisabled(elem));

    public isRadioButtonDisabled = (selector: string, debugEl = this.fixture.debugElement) =>
        this._isRadioButtonElementDisabled(
            this.getDebugElement(selector, debugEl),
        );
    public isCheckBoxDisabled = (selector: string, debugEl = this.fixture.debugElement) =>
        this._isCheckBoxDisabled(
            this.getDebugElement(selector, debugEl),
        );
    public isMatSelectDisabled = (selector: string, debugEl = this.fixture.debugElement) =>
        this._isMatSelectDisabled(
            this.getDebugElement(selector, debugEl),
        );

    public changeTheme = (theme: 'light' | 'dark') => {
        window.document.body.classList.remove('light');
        window.document.body.classList.remove('dark');
        window.document.body.classList.add(theme);
        this.fixture.detectChanges();
    };

    private _isRadioButtonElementDisabled = (debugEl: DebugElement) =>
        debugEl.nativeElement.classList.contains('mat-radio-disabled');

    private _isCheckBoxDisabled = (debugEl: DebugElement) =>
        debugEl.nativeElement.classList.contains('mat-checkbox-disabled');

    private _isMatSelectDisabled = (debugEl: DebugElement) =>
        debugEl.nativeElement.classList.contains('mat-select-disabled');
}

export class UIUtils {
    private _rootEl: HTMLElement;

    constructor(element: HTMLElement) {
        this._rootEl = element;
    }

    getElement = <T extends HTMLElement>(selector: string, element: HTMLElement = this._rootEl) =>
        element.querySelector(selector) as T | null;

    isToggleChecked = (selector: string, element: HTMLElement = this._rootEl) =>
        this.getElement(selector, element)?.classList.contains('mat-checked');

    toggleCheckbox = (selector: string, element: HTMLElement = this._rootEl) =>
        this.getElement(`${selector} .mat-checkbox-label`, element)?.dispatchEvent(EventGenerator.click);

    toggleSlider = (selector: string, element: HTMLElement = this._rootEl) =>
        this.getElement(`${selector} .mat-slide-toggle-label`, element)?.dispatchEvent(EventGenerator.click);

    setInput = (selector: string, value: any, element: HTMLElement = this._rootEl) => {
        const input = this.getElement<HTMLInputElement>(selector, element)!;
        input.value = value;
        input.dispatchEvent(EventGenerator.input());
        return input;
    };

    changeInput = (selector: string, value: any, element: HTMLElement = this._rootEl) => {
        const input = this.getElement<HTMLInputElement>(selector, element)!;
        input.value = value;

        const changeEvent = EventGenerator.change();
        const targetElement = changeEvent.target as any as { value: number };

        targetElement.value = value;
        input.dispatchEvent(changeEvent);
        input.dispatchEvent(EventGenerator.input());
        return input;
    };

    click = (selector: string, element: HTMLElement = this._rootEl) =>
        this.getElement(selector, element)!.dispatchEvent(EventGenerator.click);
}

class GridUtils<T> {
    constructor(
        private _utils: IntegrationUtils<T>,
    ) { }

    public flush = (stub: IStubEndpoint, httpClient: HttpTestingController) => {
        this._utils.fixture.detectChanges();
        tick(500);
        this._utils.fixture.detectChanges();

        this._utils.expectAndFlush(stub, httpClient);
        this._utils.fixture.detectChanges();

        flush();
        discardPeriodicTasks();
    };

    /**
     *
     * @param rowNumber The Grid row
     *
     * ---
     *
     * @param startColumn The beginning of the specified portion of the array.
     * @param endColumn The end of the specified portion of the array. This is exclusive of the element at the index 'end'.
     */
    public getCellsText = (
        rowNumber: number,
        {
            startColumn,
            endColumn,
            gridSelector,
            debugEl,
            getter = (cellEl: DebugElement) => cellEl.nativeElement.innerText as string,
        }: {
            startColumn?: number;
            endColumn?: number;
            gridSelector?: string;
            debugEl?: DebugElement;
            getter?: (cellEl: DebugElement, index: number, array: DebugElement[]) => string;
        } = {
                getter: (cellEl: DebugElement) => cellEl.nativeElement.innerText as string,
            },
    ) => {
        const rowEl = this._utils.getDebugElement(`${gridSelector ?? selectors.grid} [data-row-index="${rowNumber - 1}"]`, debugEl);
        return rowEl
            .queryAll(By.css('.ui-grid-cell'))
            .slice(startColumn, endColumn)
            .map(getter);
    };

    public getHeaders = (gridSelector = selectors.grid, debugEl = this._utils.fixture.debugElement) => {
        return this._utils.getAllDebugElements(`${gridSelector} .ui-grid-header-cell`, debugEl)
            .filter(el => this._utils.getDebugElement('.ui-grid-header-title', el));
    };

    public getColumnsProperties = (gridSelector = selectors.grid, debugEl = this._utils.fixture.debugElement) => {
        return this._utils.getAllDebugElements(`${gridSelector} .ui-grid-header-cell`, debugEl)
            .filter(el => this._utils.getDebugElement('.ui-grid-header-title', el))
            .map(el => el.attributes['data-property']);
    };

    public getHeader = (property: string, debugEl = this._utils.fixture.debugElement) => {
        return this._utils.getDebugElement(`.ui-grid-header-cell[data-property="${property}"] .ui-grid-header-title`, debugEl);
    };

    public getRowItem = (
        rowNumber: number,
        selector: string,
        {
            gridSelector,
            debugEl,
        }: {
            gridSelector?: string;
            debugEl?: DebugElement;
        } = {}) => {
        return this._utils.getDebugElement(
            `${gridSelector ?? selectors.grid} [data-row-index="${rowNumber}"] ${selector}`,
            debugEl ?? this._utils.fixture.debugElement,
        );
    };

    public getMenuDictionary = (
        rowNumber: number,
        cfg: {
            gridSelector?: string;
            menu?: string;
            debugEl?: DebugElement;
        } = {},
    ) => {
        const menuItems = this.getMenuItems(rowNumber, cfg);
        return menuItems.reduce((acc, step) => {
            return {
                ...acc,
                [step.text]: step,
            };
        }, {} as Record<string, { text: string; href: string | undefined }>);
    };

    public getMenuItems = (
        rowNumber: number,
        {
            gridSelector,
            menu,
            debugEl,
        }: {
            gridSelector?: string;
            menu?: string;
            debugEl?: DebugElement;
        } = {},
    ) => {
        gridSelector = gridSelector ?? selectors.grid;
        menu = menu ?? selectors.inlineMenu;

        this._utils.click(`${gridSelector} [data-row-index="${rowNumber}"] ${menu}`, debugEl);
        this._utils.fixture.detectChanges();
        const nodes = this._utils.getAllDebugElements('.cdk-overlay-container .mat-menu-item', debugEl);

        return nodes.map(item => ({
            text: item.query(By.css('span')).nativeElement.innerText,
            href: (item.nativeElement as HTMLAnchorElement).href as string | undefined,
            node: item.nativeElement,
        }));
    };

    public clickMenuItem = (
        rowIndex: number,
        actionSelector: string,
        {
            gridSelector,
            inlineMenuSelector,
            debugEl,
        }: {
            gridSelector?: string;
            inlineMenuSelector?: string;
            debugEl?: DebugElement;
        } = {},
    ) => {
        inlineMenuSelector = inlineMenuSelector ?? selectors.inlineMenu;

        this.clickRowItem(rowIndex, inlineMenuSelector, { gridSelector, debugEl });
        this._utils.fixture.detectChanges();

        this._utils.click(actionSelector, debugEl);
        this._utils.fixture.detectChanges();
    };

    public clickRowItem = (
        rowNumber: number,
        selector: string,
        {
            gridSelector,
            debugEl,
        }: {
            gridSelector?: string;
            debugEl?: DebugElement;
        } = {}) => {
        return this.getRowItem(rowNumber, selector, { debugEl, gridSelector }).nativeElement
            .dispatchEvent(EventGenerator.click);
    };

    public getRowCheckbox = (rowNumber: number, gridSelector = selectors.grid, debugEl = this._utils.fixture.debugElement) => {
        const rowEl = this._utils.getDebugElement(`${gridSelector} [data-row-index="${rowNumber - 1}"]`, debugEl);

        const rowCheckbox = this._utils.getDebugElement('mat-checkbox input', rowEl);

        return rowCheckbox;
    };

    public checkRow = (rowNumber: number, gridSelector = selectors.grid, debugEl = this._utils.fixture.debugElement) => {
        this.getRowCheckbox(rowNumber, gridSelector, debugEl).nativeElement.dispatchEvent(EventGenerator.click);
        this._utils.fixture.detectChanges();
    };

    public openContextMenu = (rowNumber: number) => {
        const selector = `${`[data-row-index="${rowNumber - 1}"]`} ${'[data-cy="grid-action-menu"]'}`;
        const button = this._utils.fixture.debugElement.query(By.css(selector));
        button.nativeElement.dispatchEvent(EventGenerator.click);
    };

    public openSearchFilter = ({
        columnName,
    }: {
        columnName: string;
    }) => {
        const selector = `[data-cy="ui-grid-search-filter-${columnName}"] [role="combobox"]`;
        const button = this._utils.fixture.debugElement.query(By.css(selector));
        expect(button).toBeTruthy();

        button.nativeElement.dispatchEvent(EventGenerator.click);
        this._utils.fixture.detectChanges();
        tick(300);
    };

    public filterData = ({
        columnName,
        nth,
        overlayContainerElement,
    }: {
        columnName: string;
        nth: number;
        overlayContainerElement: HTMLElement;
    }) => {
        const selector = `[data-column-name="ui-grid-dropdown-filter-${columnName}"]`;
        const button = this._utils.fixture.debugElement.query(By.css(selector));
        button.nativeElement.dispatchEvent(EventGenerator.click);
        this._utils.fixture.detectChanges();

        const labelButton = overlayContainerElement.querySelectorAll('button.mat-menu-item');
        labelButton[nth].dispatchEvent(EventGenerator.click);

        this._utils.fixture.detectChanges();
        tick(500);
        this._utils.fixture.detectChanges();
    };
}

class SuggestUtils<T> {
    constructor(
        private _utils: IntegrationUtils<T>,
    ) { }

    public openAndFlush = (selector: string, httpRequest: Function) => {
        this._utils.click('.display', this._utils.getDebugElement(selector));
        this._utils.fixture.detectChanges();
        httpRequest();
        this._utils.fixture.detectChanges();
    };

    // eslint-disable-next-line complexity
    public searchAndSelect = (selector: string, httpRequest?: Function, searchStr = '', nth = 0) => {
        const suggest = this._utils.getDebugElement(selector);
        const multiple = this.isMultiple(selector);
        const searchInput = this._utils.getDebugElement('input', suggest);
        const strategy = this.getFetchStrategy(selector);

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

        if (searchInput) { // && searchStr
            if (multiple && !this.isOpen(selector)) {
                this._utils.click('input', suggest);
                this._utils.fixture.detectChanges();

                if (httpRequest && strategy === 'onOpen') {
                    tick(1000);
                    this._utils.fixture.detectChanges();
                    httpRequest();
                }
            }

            this._utils.setInput('input', searchStr, suggest);
            tick(SUGGEST_DEBOUNCE);
            this._utils.fixture.detectChanges();

            if (httpRequest) { httpRequest(); }
        }
        this._utils.fixture.detectChanges();

        const listItems = suggest.queryAll(By.css('.mat-list-item'));

        const reverseOrder = !!suggest.query(By.css('.item-list-container-direction-up'));

        const listItem = listItems[reverseOrder ? listItems.length - nth - 1 : nth].nativeElement;
        listItem.dispatchEvent(EventGenerator.click);
        this._utils.fixture.detectChanges();

        if (multiple) {
            this._utils.getNativeElement(`.mat-chip-list`, suggest)!
                .dispatchEvent(EventGenerator.keyUp(Key.Escape));
            this._utils.fixture.detectChanges();
        }
    };

    public getFetchStrategy = (selector: string) => {
        const suggest = this._utils.getDebugElement(selector);
        // maybe add a getter along the setter for fetchStrategy ?
        return (suggest.componentInstance as UiSuggestComponent)['_fetchStrategy$']?.value ?? 'eager';
    };

    public selectNthItem = (selector: string, nth = 0, config?: {
        httpMock: HttpTestingController;
        stub: IStubEndpoint;
    }) => {
        const suggest = this._utils.getDebugElement(selector);
        const multiple = this.isMultiple(selector);

        if (!this.isOpen(selector)) {
            this._utils.click(multiple ? 'input' : '.display', suggest);
            this._utils.fixture.detectChanges();
        }

        const strategy = this.getFetchStrategy(selector);

        if (!!config && strategy === 'onOpen') {
            tick(1000);
            this._utils.expectAndFlush(config.stub, config.httpMock);
        }

        const listItems = suggest.queryAll(By.css('.mat-list-item'));

        const reverseOrder = !!suggest.query(By.css('.item-list-container-direction-up'));

        const listItem = listItems[reverseOrder ? listItems.length - nth - 1 : nth].nativeElement;

        listItem.dispatchEvent(EventGenerator.click);
        this._utils.fixture.detectChanges();
        tick(1000);

        if (!!config && strategy === 'eager') {
            this._utils.expectAndFlush(config.stub, config.httpMock);
        }

        return listItem;
    };

    public isMultiple = (selector: string) => {
        return !!this._utils.getNativeElement(`${selector} .multi-select`);
    };

    public isOpen = (selector: string) => {
        return !!this._utils.getNativeElement(`${selector} [aria-expanded="true"]`);
    };

    public getValue = (selector: string, debugEl = this._utils.fixture.debugElement) => {
        if (this.isMultiple(selector)) {
            return this._utils.getAllNativeElements(`${selector} .mat-chip span`, debugEl)
                .map(el => el.innerText.trim())
                .join(',');
        }

        return this._utils.getNativeElement(`${selector} .display-value`, debugEl)!
            .innerText
            .trim();
    };

    public clear = (selector: string) =>
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

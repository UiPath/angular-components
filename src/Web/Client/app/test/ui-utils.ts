import { HttpTestingController } from '@angular/common/http/testing';
import { DebugElement } from '@angular/core';
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

    constructor(
        public fixture: ComponentFixture<T>,
    ) { }

    public getDebugElement = (selector: string, debugEl = this.fixture.debugElement) =>
        debugEl.query(By.css(selector));

    public getAllDebugElements = (selector: string, debugEl = this.fixture.debugElement) =>
        debugEl.queryAll(By.css(selector));

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

    public switchToTab = async(number: number, debugEl = this.fixture.debugElement) => {
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

    public expectAndFlush = (stub: IStubEndpoint, httpClient: HttpTestingController) => {
        const testReq = httpClient.expectOne(request => request.url.includes(stub.url));
        testReq.flush(stub.response);

        return testReq;
    };

    public setInput = (selector: string, value: any, debugEl = this.fixture.debugElement) => {
        const input = this.getNativeElement<HTMLInputElement>(selector, debugEl)!;
        input.value = value;
        input.dispatchEvent(EventGenerator.input());
        this.fixture.detectChanges();
    };

    public isCheckboxChecked = (selector: string, debugEl = this.fixture.debugElement) =>
        this.getDebugElement(selector, debugEl)
            .nativeElement
            .classList
            .contains('mat-checkbox-checked');

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
        this.getDebugElement(selector, debugEl)
            .query(By.css('.mat-slide-toggle-label'))
            .nativeElement
            .dispatchEvent(EventGenerator.click);

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
        this.getDebugElement(selector, debugEl)
            .nativeElement
            .classList
            .contains('mat-checked');

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
        }: {
            startColumn?: number;
            endColumn?: number;
            gridSelector?: string;
            debugEl?: DebugElement;
        } = {},
    ) => {
        const rowEl = this._utils.getDebugElement(`${gridSelector ?? selectors.grid} [data-row-index="${rowNumber - 1}"]`, debugEl);
        return rowEl
            .queryAll(By.css('.ui-grid-cell'))
            .slice(startColumn, endColumn)
            .map((cellEl) => cellEl.nativeElement.innerText as string);
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

        const nodes = this._utils.getAllNativeElements<HTMLButtonElement | HTMLAnchorElement>
        ('.cdk-overlay-container .mat-menu-item', debugEl);

        return nodes.map(item => ({
            text: item.innerText,
            href: (item as HTMLAnchorElement).href as string | undefined,
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

    public checkRow = (rowNumber: number, gridSelector = selectors.grid, debugEl = this._utils.fixture.debugElement) => {
        const rowEl = this._utils.getDebugElement(`${gridSelector} [data-row-index="${rowNumber - 1}"]`, debugEl);

        const rowCheckbox = this._utils.getDebugElement('mat-checkbox input', rowEl);

        rowCheckbox.nativeElement.dispatchEvent(EventGenerator.click);
        this._utils.fixture.detectChanges();
    };

    public openContextMenu = (rowNumber: number) => {
        const selector = `${`[data-row-index="${rowNumber - 1}"]`} ${'[data-cy="grid-action-menu"]'}`;
        const button = this._utils.fixture.debugElement.query(By.css(selector));
        button.nativeElement.dispatchEvent(EventGenerator.click);
    };
}

class SuggestUtils<T> {
    constructor(
        private _utils: IntegrationUtils<T>,
    ) { }

    public searchAndSelect = (selector: string, httpRequest?: Function, searchStr = '', nth = 0) => {
        const suggest = this._utils.getDebugElement(selector);

        this._utils.click('.display', suggest);
        this._utils.fixture.detectChanges();

        const searchInput = this._utils.getDebugElement('input', suggest);

        if (searchInput) {
            this._utils.setInput('input', searchStr, suggest);
            tick(SUGGEST_DEBOUNCE);

            if (httpRequest) { httpRequest(); }
        }
        this._utils.fixture.detectChanges();

        const listItems = suggest.queryAll(By.css('.mat-list-item'));

        const reverseOrder = !!suggest.query(By.css('.item-list-container-direction-up'));

        const listItem = listItems[reverseOrder ? listItems.length - nth - 1 : nth].nativeElement;

        listItem.dispatchEvent(EventGenerator.click);
        this._utils.fixture.detectChanges();
    };

    public getFetchStrategy = (selector: string) => {
        const suggest = this._utils.getDebugElement(selector);
        // maybe add a getter along the setter for fetchStrategy ?
        return (suggest.componentInstance as UiSuggestComponent)['_fetchStrategy$'].value;
    };

    public selectNthItem = async(selector: string, nth: number, config?: {
        httpMock: HttpTestingController;
        stub: IStubEndpoint;
    }) => {
        const suggest = this._utils.getDebugElement(selector);

        this._utils.click('.display', suggest);
        this._utils.fixture.detectChanges();

        const strategy = this.getFetchStrategy(selector);

        if (!!config && strategy === 'onOpen') {
            await this._utils.fixture.whenStable();
            this._utils.expectAndFlush(config.stub, config.httpMock);
        }

        const listItems = suggest.queryAll(By.css('.mat-list-item'));

        const reverseOrder = !!suggest.query(By.css('.item-list-container-direction-up'));

        const listItem = listItems[reverseOrder ? listItems.length - nth - 1 : nth].nativeElement;

        listItem.dispatchEvent(EventGenerator.click);
        this._utils.fixture.detectChanges();
        await this._utils.fixture.whenStable();

        if (!!config && strategy === 'eager') {
            this._utils.expectAndFlush(config.stub, config.httpMock);
        }
    };

    public getValue = (selector: string, debugEl = this._utils.fixture.debugElement) =>
        this._utils.getNativeElement(`${selector} .display-value`, debugEl)!
            .innerText
            .trim();
}

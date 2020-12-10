import { HttpTestingController } from '@angular/common/http/testing';
import { DebugElement } from '@angular/core';
import {
    ComponentFixture,
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

export class IntegrationUtils<T> {
    public get component() {
        return this.fixture.componentInstance;
    }

    constructor(
        public fixture: ComponentFixture<T>,
    ) { }

    public getDebugElement = (selector: string, debugEl = this.fixture.debugElement) =>
        debugEl.query(By.css(selector))

    public getAllDebugElements = (selector: string, debugEl = this.fixture.debugElement) =>
        debugEl.queryAll(By.css(selector))

    public getNativeElement = <U extends HTMLElement>(selector: string, debugEl = this.fixture.debugElement) => {
        const debugElement = this.getDebugElement(selector, debugEl);
        return !!debugElement ? debugElement.nativeElement as U : null;
    }

    public getAllNativeElements = <U extends HTMLElement>(selector: string, debugEl = this.fixture.debugElement) => {
        const debugElements = this.getAllDebugElements(selector, debugEl);
        return debugElements.map(e => e.nativeElement as U);
    }

    public getComponent = (selector: string, debugEl = this.fixture.debugElement) => {
        const debugElement = this.getDebugElement(selector, debugEl);
        return !!debugElement ? debugElement.componentInstance : null;
    }

    public getGridCellsText = (gridSelector: string, rowNumber: number, cellNumbers: number[], debugEl = this.fixture.debugElement) => {
        const rowEl = this.getDebugElement(`${gridSelector} [data-row-index="${rowNumber - 1}"]`, debugEl);
        return rowEl
            .queryAll(By.css('.ui-grid-cell'))
            .filter((_, index) => cellNumbers.includes(index + 1))
            .map((cellEl) => cellEl.nativeElement.innerText);
    }

    public getGridHeaders = (gridSelector: string, debugEl = this.fixture.debugElement) => {
        return this.getAllDebugElements(`${gridSelector} .ui-grid-header-cell`, debugEl)
            .filter(el => this.getDebugElement('.ui-grid-header-title', el));
    }

    public getGridColumnsProperties = (gridSelector: string, debugEl = this.fixture.debugElement) => {
        return this.getAllDebugElements(`${gridSelector} .ui-grid-header-cell`, debugEl)
            .filter(el => this.getDebugElement('.ui-grid-header-title', el))
            .map(el => el.attributes['data-property']);
    }

    public getGridHeader = (property: string, debugEl = this.fixture.debugElement) => {
        return this.getDebugElement(`.ui-grid-header-cell[data-property="${property}"] .ui-grid-header-title`, debugEl);
    }

    public getGridRowItem = (gridSelector: string, rowNumber: number, selector: string, debugEl = this.fixture.debugElement) => {
        return this.getDebugElement(`${gridSelector} [data-row-index="${rowNumber - 1}"] ${selector}`, debugEl);
    }

    public clickGridRowItem = (gridSelector: string, rowNumber: number, selector: string, debugEl = this.fixture.debugElement) => {
        return this.getGridRowItem(gridSelector, rowNumber, selector, debugEl).nativeElement
            .dispatchEvent(EventGenerator.click);
    }

    public switchToTab = async (number: number, debugEl = this.fixture.debugElement) => {
        const tab = this.getDebugElement(`.mat-tab-label:nth-of-type(${number}) .mat-tab-label-content`, debugEl);
        tab.nativeElement.dispatchEvent(EventGenerator.click);
        this.fixture.detectChanges();
        await this.fixture.whenRenderingDone();
        this.fixture.detectChanges();
    }

    public checkGridRow = (gridSelector: string, rowNumber: number, debugEl = this.fixture.debugElement) => {
        const rowEl = this.getDebugElement(`${gridSelector} [data-row-index="${rowNumber - 1}"]`, debugEl);

        const rowCheckbox = this.getDebugElement(`mat-checkbox input`, rowEl);

        rowCheckbox.nativeElement.dispatchEvent(EventGenerator.click);
        this.fixture.detectChanges();
    }

    public click = (selector: string, debugEl = this.fixture.debugElement) =>
        this.getNativeElement(selector, debugEl)!
            .dispatchEvent(EventGenerator.click)

    public clickRadioButton = (selector: string, debugEl = this.fixture.debugElement) =>
        this.click(`${selector} .mat-radio-label`, debugEl)

    public enter = (selector: string, debugEl = this.fixture.debugElement) =>
        this.getNativeElement(selector, debugEl)!
            .dispatchEvent(EventGenerator.keyDown(Key.Enter))

    public expectAndFlush = (stub: IStubEndpoint, httpClient: HttpTestingController) => {
        httpClient
            .expectOne(request => request.url.includes(stub.url))
            .flush(stub.response);
    }

    public setInput = (selector: string, value: any, debugEl = this.fixture.debugElement) => {
        const input = this.getNativeElement<HTMLInputElement>(selector, debugEl)!;
        input.value = value;
        input.dispatchEvent(EventGenerator.input());
        this.fixture.detectChanges();
    }

    public searchAndSelect = (selector: string, httpRequest?: Function, searchStr = '', nth = 0) => {
        const suggest = this.getDebugElement(selector);

        this.click(`.display`, suggest);
        this.fixture.detectChanges();

        const searchInput = this.getDebugElement('input', suggest);

        if (searchInput) {
            this.setInput('input', searchStr, suggest);
            tick(SUGGEST_DEBOUNCE);

            if (httpRequest) { httpRequest(); }
        }
        this.fixture.detectChanges();

        const listItems = suggest.queryAll(By.css('.mat-list-item'));

        const reverseOrder = !!suggest.query(By.css('.item-list-container-direction-up'));

        const listItem = listItems[reverseOrder ? listItems.length - nth - 1 : nth].nativeElement;

        listItem.dispatchEvent(EventGenerator.click);
        this.fixture.detectChanges();
    }

    public getUiSuggestFetchStrategy = (selector: string) => {
        const suggest = this.getDebugElement(selector);
        // maybe add a getter along the setter for fetchStrategy ?
        return (suggest.componentInstance as UiSuggestComponent)['_fetchStrategy$'].value;
    }

    public selectNthUiSuggestItem = async (selector: string, nth: number, config?: {
        httpMock: HttpTestingController,
        stub: IStubEndpoint,
    }) => {
        const suggest = this.getDebugElement(selector);

        this.click(`.display`, suggest);
        this.fixture.detectChanges();

        const strategy = this.getUiSuggestFetchStrategy(selector);

        if (!!config && strategy === 'onOpen') {
            this.expectAndFlush(config.stub, config.httpMock);
        }

        const listItems = suggest.queryAll(By.css('.mat-list-item'));

        const reverseOrder = !!suggest.query(By.css('.item-list-container-direction-up'));

        const listItem = listItems[reverseOrder ? listItems.length - nth - 1 : nth].nativeElement;

        listItem.dispatchEvent(EventGenerator.click);
        this.fixture.detectChanges();
        await this.fixture.whenStable();

        if (!!config && strategy === 'eager') {
            this.expectAndFlush(config.stub, config.httpMock);
        }
    }

    public getUiSuggestValue = (selector: string, debugEl = this.fixture.debugElement) =>
        this.getNativeElement(`${selector} .display-value`, debugEl)!
            .innerText
            .trim()

    public isCheckboxChecked = (selector: string, debugEl = this.fixture.debugElement) =>
        this.getDebugElement(selector, debugEl)
            .nativeElement
            .classList
            .contains('mat-checkbox-checked')

    public toggleCheckbox = (selector: string, debugEl = this.fixture.debugElement) =>
        this.getDebugElement(selector, debugEl)
            .query(By.css('.mat-checkbox-label'))
            .nativeElement
            .dispatchEvent(EventGenerator.click)

    public setCheckboxState = (selector: string, state: boolean, debugEl = this.fixture.debugElement) => {
        const isChecked = this.isCheckboxChecked(selector, debugEl);
        if (
            !isChecked && state ||
            isChecked && !state
        ) {
            this.toggleCheckbox(selector);
        }
    }

    public toggleSlider = (selector: string, debugEl = this.fixture.debugElement) =>
        this.getDebugElement(selector, debugEl)
            .query(By.css('.mat-slide-toggle-label'))
            .nativeElement
            .dispatchEvent(EventGenerator.click)

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
            .contains('mat-checked')

    public isRadioButtonChecked = (selector: string, debugEl = this.fixture.debugElement) =>
        this.getDebugElement(selector, debugEl)
            .nativeElement
            .classList
            .contains('mat-radio-checked')

    public isRadioGroupDisabled = (selector: string, debugEl = this.fixture.debugElement) =>
        this.getDebugElement(selector, debugEl)
            .queryAll(By.css('mat-radio-button'))
            .every((elem) => this._isRadioButtonElementDisabled(elem))

    public isRadioButtonDisabled = (selector: string, debugEl = this.fixture.debugElement) =>
        this._isRadioButtonElementDisabled(
            this.getDebugElement(selector, debugEl),
        )
    public isCheckBoxDisabled = (selector: string, debugEl = this.fixture.debugElement) =>
        this._isCheckBoxDisabled(
            this.getDebugElement(selector, debugEl),
        )

    public openGridContextMenu = (rowNumber: number) => {
        const selector = `${`[data-row-index="${rowNumber - 1}"]`} ${`[data-cy="grid-action-menu"]`}`;
        const button = this.fixture.debugElement.query(By.css(selector));
        button.nativeElement.dispatchEvent(EventGenerator.click);
    }

    private _isRadioButtonElementDisabled = (debugEl: DebugElement) =>
        debugEl.nativeElement.classList.contains('mat-radio-disabled')

    private _isCheckBoxDisabled = (debugEl: DebugElement) =>
        debugEl.nativeElement.classList.contains('mat-checkbox-disabled')
}

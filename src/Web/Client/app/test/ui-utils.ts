import { HttpTestingController } from '@angular/common/http/testing';
import { DebugElement } from '@angular/core';
import {
    ComponentFixture,
    tick,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
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

    public getNativeElement = (selector: string, debugEl = this.fixture.debugElement) => {
        const debugElement = this.getDebugElement(selector, debugEl);
        return !!debugElement ? debugElement.nativeElement : null;
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

    public click = (selector: string, debugEl = this.fixture.debugElement) =>
        this.getNativeElement(selector, debugEl)
            .dispatchEvent(EventGenerator.click)

    public clickRadioButton = (selector: string, debugEl = this.fixture.debugElement) =>
        this.click(`${selector} .mat-radio-label`, debugEl)

    public enter = (selector: string, debugEl = this.fixture.debugElement) =>
        this.getNativeElement(selector, debugEl)
            .dispatchEvent(EventGenerator.keyDown(Key.Enter))

    public expectAndFlush = (stub: IStubEndpoint, httpClient: HttpTestingController) => {
        httpClient
            .expectOne(request => request.url.includes(stub.url))
            .flush(stub.response);
    }

    public setInput = (selector: string, value: any, debugEl = this.fixture.debugElement) => {
        const input = this.getNativeElement(selector, debugEl);
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

        const listItems = suggest.queryAll(By.css('.mat-list-item'));
        const listItem = listItems[nth].nativeElement;

        listItem.dispatchEvent(EventGenerator.click);
        this.fixture.detectChanges();
    }

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

    private _isRadioButtonElementDisabled = (debugEl: DebugElement) =>
        debugEl.nativeElement.classList.contains('mat-radio-disabled')
}

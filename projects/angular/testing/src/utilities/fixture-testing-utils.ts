import { HttpTestingController } from '@angular/common/http/testing';
import {
    DebugElement,
    Type,
} from '@angular/core';
import {
    ComponentFixture,
    discardPeriodicTasks,
    flush,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
    EventGenerator,
    Key,
    SuggestUtils,
} from '@uipath/angular/testing';

import { HTMLTestingUtils } from './html-testing-utils';

export interface IStubEndpoint {
    url: string;
    response: any;
}

export class FixtureTestingUtils<T> {
    get component() {
        return this.fixture.componentInstance;
    }

    suggest = new SuggestUtils<T>(this);
    uiUtils = new HTMLTestingUtils(this.fixture.nativeElement);

    constructor(
        public fixture: ComponentFixture<T>,
    ) { }

    getDebugElement = (selector: string, debugEl = this.fixture.debugElement) =>
        debugEl.query(By.css(selector));

    getAllDebugElements = (selector: string, debugEl = this.fixture.debugElement) =>
        debugEl.queryAll(By.css(selector));

    getChildComponentInstance = (type: Type<any>, debugEl = this.fixture.debugElement) =>
        debugEl.query(By.directive(type))?.componentInstance;

    getAllChildComponentInstances = (type: Type<any>, debugEl = this.fixture.debugElement) =>
        debugEl.queryAll(By.directive(type)).map(el => el.componentInstance);

    getNativeElement = <U extends HTMLElement>(selector: string, debugEl = this.fixture.debugElement) => {
        const debugElement = this.getDebugElement(selector, debugEl);
        return debugElement ? debugElement.nativeElement as U : null;
    };

    getAllNativeElements = <U extends HTMLElement>(selector: string, debugEl = this.fixture.debugElement) => {
        const debugElements = this.getAllDebugElements(selector, debugEl);
        return debugElements.map(e => e.nativeElement as U);
    };

    getComponent = (selector: string, debugEl = this.fixture.debugElement) => {
        const debugElement = this.getDebugElement(selector, debugEl);
        return debugElement ? debugElement.componentInstance : null;
    };

    switchToTab = async (tabNumber: number, debugEl = this.fixture.debugElement) => {
        const tab = this.getDebugElement(`.mat-tab-label:nth-of-type(${tabNumber}) .mat-tab-label-content`, debugEl);
        tab.nativeElement.dispatchEvent(EventGenerator.click);
        this.fixture.detectChanges();
        await this.fixture.whenRenderingDone();
        this.fixture.detectChanges();
    };

    click = (selector: string, debugEl = this.fixture.debugElement) =>
        this.getNativeElement(selector, debugEl)!
            .dispatchEvent(EventGenerator.click);

    clickRadioButton = (selector: string, debugEl = this.fixture.debugElement) =>
        this.click(`${selector} .mat-radio-label`, debugEl);

    enter = (selector: string, debugEl = this.fixture.debugElement) =>
        this.getNativeElement(selector, debugEl)!
            .dispatchEvent(EventGenerator.keyDown(Key.Enter));

    expectAndFlush = (stub: IStubEndpoint, httpClient: HttpTestingController, params: Record<string, string> = {}) => {
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

    flushDiscardAndDetect = (times = 1) => {
        new Array(times).fill(0).forEach(() => {
            flush();
            discardPeriodicTasks();
            this.fixture.detectChanges();
        });
    };

    setInput = (selector: string, value: any, debugEl = this.fixture.debugElement) => {
        const input = this.uiUtils.setInput(selector, value, debugEl.nativeElement);
        this.fixture.detectChanges();
        return input;
    };

    changeInput = (selector: string, value: any, debugEl = this.fixture.debugElement) => {
        const input = this.uiUtils.changeInput(selector, value, debugEl.nativeElement);
        this.fixture.detectChanges();
        return input;
    };

    isCheckboxChecked = (selector: string, debugEl = this.fixture.debugElement) =>
        this.getDebugElement(selector, debugEl)
            .nativeElement
            .classList
            .contains('mat-checkbox-checked');

    isCheckboxIndeterminate = (selector: string, debugEl = this.fixture.debugElement) =>
        this.getDebugElement(selector, debugEl)
            .nativeElement
            .classList
            .contains('mat-checkbox-indeterminate');

    toggleCheckbox = (selector: string, debugEl = this.fixture.debugElement) =>
        this.getDebugElement(selector, debugEl)
            .query(By.css('.mat-checkbox-label'))
            .nativeElement
            .dispatchEvent(EventGenerator.click);

    setCheckboxState = (selector: string, state: boolean, debugEl = this.fixture.debugElement) => {
        const isChecked = this.isCheckboxChecked(selector, debugEl);
        if (
            !isChecked && state ||
            isChecked && !state
        ) {
            this.toggleCheckbox(selector);
        }
    };

    toggleSlider = (selector: string, debugEl = this.fixture.debugElement) =>
        this.uiUtils.toggleSlider(selector, debugEl.nativeElement);

    setSliderState(selector: string, state: boolean, debugEl = this.fixture.debugElement) {
        const isToggled = this.isToggleChecked(selector, debugEl);
        if (
            isToggled && !state ||
            !isToggled && state
        ) {
            debugEl.query(By.css(`${selector} input[type=checkbox]`)).nativeElement.click();
        }
    }

    isToggleChecked = (selector: string, debugEl = this.fixture.debugElement) =>
        this.uiUtils.isToggleChecked(selector, debugEl.nativeElement);

    isRadioButtonChecked = (selector: string, debugEl = this.fixture.debugElement) =>
        this.getDebugElement(selector, debugEl)
            .nativeElement
            .classList
            .contains('mat-radio-checked');

    isRadioGroupDisabled = (selector: string, debugEl = this.fixture.debugElement) =>
        this.getDebugElement(selector, debugEl)
            .queryAll(By.css('mat-radio-button'))
            .every((elem) => this._elementHasClass('mat-radio-button', elem, 'mat-radio-disabled'));

    isRadioButtonDisabled = (selector: string, debugEl = this.fixture.debugElement) =>
        this._elementHasClass(
            selector, debugEl, 'mat-radio-disabled',
        );
    isCheckBoxDisabled = (selector: string, debugEl = this.fixture.debugElement) =>
        this._elementHasClass(
            selector, debugEl, 'mat-checkbox-disabled',
        );
    isMatSelectDisabled = (selector: string, debugEl = this.fixture.debugElement) =>
        this._elementHasClass(
            selector, debugEl, 'mat-select-disabled',
        );
    isSlideToggleDisabled = (selector: string, debugEl = this.fixture.debugElement) =>
        this._elementHasClass(
            selector, debugEl, 'mat-disabled',
        );

    changeTheme = (theme: 'light' | 'dark') => {
        window.document.body.classList.remove('light');
        window.document.body.classList.remove('dark');
        window.document.body.classList.add(theme);
        this.fixture.detectChanges();
    };

    private _elementHasClass = (selector: string, debugEl: DebugElement, className: string) => {
        debugEl = this.getDebugElement(selector, debugEl);
        return !!debugEl.nativeElement.classList.contains(className);
    };
}

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

import { EventGenerator } from './event-generator';
import { HtmlTestingUtils } from './html-testing-utils';
import { Key } from './key';

export interface IStubEndpoint {
    url: string;
    response: any;
}

export class FixtureTestingUtils<T> {
    get component() {
        return this.fixture.componentInstance;
    }

    htmlTestingUtils = new HtmlTestingUtils(this.fixture.nativeElement);

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
        const tab = this.getDebugElement(`.mat-mdc-tab:nth-of-type(${tabNumber}) .mdc-tab__content`, debugEl);
        tab.nativeElement.dispatchEvent(EventGenerator.click);
        this.fixture.detectChanges();
        await this.fixture.whenRenderingDone();
        this.fixture.detectChanges();
    };

    click = (selector: string, debugEl = this.fixture.debugElement) =>
        this.getNativeElement(selector, debugEl)!
            .dispatchEvent(EventGenerator.click);

    clickRadioButton = (selector: string, debugEl = this.fixture.debugElement) =>
        this.click(`${selector} label`, debugEl);

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
        const input = this.htmlTestingUtils.setInput(selector, value, debugEl.nativeElement);
        this.fixture.detectChanges();
        return input;
    };

    elementContainsClass = (className: string) => (selector: string, debugEl = this.fixture.debugElement) =>
        this.getDebugElement(selector, debugEl)
        .nativeElement
        .classList
        .contains(className);

    // eslint-disable-next-line @typescript-eslint/member-ordering
    isCheckboxChecked = this.elementContainsClass('mat-mdc-checkbox-checked');

    isCheckboxIndeterminate = (selector: string, debugEl = this.fixture.debugElement) =>
        !!this.getDebugElement(selector, debugEl)
            .query(By.css('.mdc-checkbox__native-control:indeterminate~.mdc-checkbox__background'))
            .nativeElement;

    toggleCheckbox = (selector: string, debugEl = this.fixture.debugElement) =>
        this.getDebugElement(selector, debugEl)
            .query(By.css('label'))
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
        this.htmlTestingUtils.toggleSlider(selector, debugEl.nativeElement);

    setSliderState(selector: string, state: boolean, debugEl = this.fixture.debugElement) {
        const isToggled = this.isToggleChecked(selector, debugEl);
        if (
            isToggled && !state ||
            !isToggled && state
        ) {
            debugEl.query(By.css(`${selector} button[role=switch]`)).nativeElement.click();
        }
    }

    isToggleChecked = (selector: string, debugEl = this.fixture.debugElement) =>
        this.htmlTestingUtils.isToggleChecked(selector, debugEl.nativeElement);

    // eslint-disable-next-line @typescript-eslint/member-ordering
    isRadioButtonChecked = this.elementContainsClass('mat-mdc-radio-checked');

    isRadioGroupDisabled = (selector: string, debugEl = this.fixture.debugElement) =>
        this.getDebugElement(selector, debugEl)
            .queryAll(By.css('mat-radio-button'))
            .every((elem) => this._elementHasClass('mat-radio-button .mdc-radio', elem, 'mdc-radio--disabled'));

    isRadioButtonDisabled = (selector: string, debugEl = this.fixture.debugElement) =>
        this._elementHasClass(
            `${selector} .mdc-radio`, debugEl, 'mdc-radio--disabled',
        );
    isCheckBoxDisabled = (selector: string, debugEl = this.fixture.debugElement) =>
        this._elementHasClass(
            selector, debugEl, 'mat-mdc-checkbox-disabled',
        );
    isMatSelectDisabled = (selector: string, debugEl = this.fixture.debugElement) =>
        this._elementHasClass(
            selector, debugEl, 'mat-mdc-select-disabled',
        );
    isSlideToggleDisabled = (selector: string, debugEl = this.fixture.debugElement) =>
        this._elementHasClass(
            `${selector} button[role="switch"]`, debugEl, 'mdc-switch--disabled',
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

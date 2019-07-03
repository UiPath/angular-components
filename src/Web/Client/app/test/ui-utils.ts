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

    public click = (selector: string, debugEl = this.fixture.debugElement) =>
        this.getNativeElement(selector, debugEl)
            .dispatchEvent(EventGenerator.click)

    public enter = (selector: string, debugEl = this.fixture.debugElement) =>
        this.getNativeElement(selector, debugEl)
            .dispatchEvent(EventGenerator.keyDown(Key.Enter))

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
}

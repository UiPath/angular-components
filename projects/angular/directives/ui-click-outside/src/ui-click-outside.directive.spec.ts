import { Component } from '@angular/core';
import {
    ComponentFixture,
    fakeAsync,
    TestBed,
    tick,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { EventGenerator } from '@uipath/angular/testing';

import { UiClickOutsideModule } from './ui-click-outside.module';

const OUTER_CONTAINER_ID = 'outer-container';
const CONTAINER_ID = 'container';
const BTN_CLASS = 'btn';
const TEXT_WRAPPER_CLASS = 'text-wrapper';
const TEXT_ELEMENT_SELECTOR = 'p';

@Component({
    template: `
        <div id="${OUTER_CONTAINER_ID}">
            <button class="${BTN_CLASS}">
            </button>
            <div class="${TEXT_WRAPPER_CLASS}">
                <p>Outer Container Text</p>
            </div>
        </div>
        <div id="${CONTAINER_ID}"
             (uiClickOutside)="onClickOutside($event)">
            <button class="${BTN_CLASS}">
            </button>
            <div class="${TEXT_WRAPPER_CLASS}">
                <p>Container Text</p>
            </div>
        </div>
    `,
})
class ClickOutsideFixtureComponent {
    public onClickOutside(ev: MouseEvent): MouseEvent {
        return ev;
    }
}

describe('Directive: UiClickOutside', () => {
    let component: ClickOutsideFixtureComponent;
    let fixture: ComponentFixture<ClickOutsideFixtureComponent>;
    let handlerSpy: jasmine.Spy;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                UiClickOutsideModule,
            ],
            declarations: [
                ClickOutsideFixtureComponent,
            ],
        });
        fixture = TestBed.createComponent(ClickOutsideFixtureComponent);
        component = fixture.componentInstance;
        handlerSpy = spyOn(component, 'onClickOutside');
        handlerSpy.and.callThrough();
        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
    });

    [
        EventGenerator.click,
        EventGenerator.contextmenu,

    ].forEach(e => {
        describe(`Action: ${e.type}`, () => {
            describe(`Scenario: on outer container`, () => {

                describe('Context: self', () => {
                    it(`should emit when ${e.type}-ing the parent`, () => {
                        fixture.detectChanges();

                        const containerDgbEl = fixture.debugElement.query(By.css(`#${OUTER_CONTAINER_ID}`));

                        containerDgbEl.nativeElement.dispatchEvent(e);
                        fixture.detectChanges();

                        expect(handlerSpy).toHaveBeenCalled();
                        expect(handlerSpy).toHaveBeenCalledTimes(1);

                        const ev: MouseEvent = handlerSpy.calls.mostRecent().returnValue;
                        expect(ev.constructor).toBe(MouseEvent);
                        expect(ev.target).toBe(containerDgbEl.nativeElement);
                    });
                });

                describe('Context: children', () => {
                    it(`should emit when ${e.type}-ing the button`, () => {
                        fixture.detectChanges();

                        const containerDgbEl = fixture.debugElement.query(By.css(`#${OUTER_CONTAINER_ID}`));
                        const buttonDbgEl = containerDgbEl.query(By.css(`.${BTN_CLASS}`));

                        buttonDbgEl.nativeElement.dispatchEvent(e);
                        fixture.detectChanges();

                        expect(handlerSpy).toHaveBeenCalled();
                        expect(handlerSpy).toHaveBeenCalledTimes(1);

                        const ev: MouseEvent = handlerSpy.calls.mostRecent().returnValue;
                        expect(ev.constructor).toBe(MouseEvent);
                        expect(ev.target).toBe(buttonDbgEl.nativeElement);
                    });

                    it(`should emit when ${e.type}-ing the text wrapper`, () => {
                        fixture.detectChanges();

                        const containerDgbEl = fixture.debugElement.query(By.css(`#${OUTER_CONTAINER_ID}`));
                        const txtWrapperDebugEl = containerDgbEl.query(By.css(`.${TEXT_WRAPPER_CLASS}`));

                        txtWrapperDebugEl.nativeElement.dispatchEvent(e);
                        fixture.detectChanges();

                        expect(handlerSpy).toHaveBeenCalled();
                        expect(handlerSpy).toHaveBeenCalledTimes(1);

                        const ev: MouseEvent = handlerSpy.calls.mostRecent().returnValue;
                        expect(ev.constructor).toBe(MouseEvent);
                        expect(ev.target).toBe(txtWrapperDebugEl.nativeElement);
                    });

                    it(`should emit when ${e.type}-ing the text`, () => {
                        fixture.detectChanges();

                        const containerDgbEl = fixture.debugElement.query(By.css(`#${OUTER_CONTAINER_ID}`));
                        const txtDebugEl = containerDgbEl.query(By.css(TEXT_ELEMENT_SELECTOR));

                        txtDebugEl.nativeElement.dispatchEvent(e);
                        fixture.detectChanges();

                        expect(handlerSpy).toHaveBeenCalled();
                        expect(handlerSpy).toHaveBeenCalledTimes(1);

                        const ev: MouseEvent = handlerSpy.calls.mostRecent().returnValue;
                        expect(ev.constructor).toBe(MouseEvent);
                        expect(ev.target).toBe(txtDebugEl.nativeElement);
                    });

                    it(`should emit when ${e.type}-ing the ALL the children`, fakeAsync(() => {
                        const THROTTLE = 1000 / 3 + 1;

                        let ev: MouseEvent;
                        fixture.detectChanges();

                        // BUTTON CLICK
                        const containerDgbEl = fixture.debugElement.query(By.css(`#${OUTER_CONTAINER_ID}`));

                        const buttonDbgEl = containerDgbEl.query(By.css(`.${BTN_CLASS}`));
                        buttonDbgEl.nativeElement.dispatchEvent(e);
                        fixture.detectChanges();
                        tick(THROTTLE);

                        expect(handlerSpy).toHaveBeenCalled();
                        expect(handlerSpy).toHaveBeenCalledTimes(1);

                        ev = handlerSpy.calls.mostRecent().returnValue;
                        expect(ev.constructor).toBe(MouseEvent);
                        expect(ev.target).toBe(buttonDbgEl.nativeElement);

                        // TEXT WRAPPER CLICK
                        const txtWrapperDebugEl = containerDgbEl.query(By.css(`.${TEXT_WRAPPER_CLASS}`));
                        txtWrapperDebugEl.nativeElement.dispatchEvent(e);
                        fixture.detectChanges();
                        tick(THROTTLE);

                        expect(handlerSpy).toHaveBeenCalled();
                        expect(handlerSpy).toHaveBeenCalledTimes(2);

                        ev = handlerSpy.calls.mostRecent().returnValue;
                        expect(ev.constructor).toBe(MouseEvent);
                        expect(ev.target).toBe(txtWrapperDebugEl.nativeElement);

                        // TEXT CLICK
                        const txtDebugEl = containerDgbEl.query(By.css(TEXT_ELEMENT_SELECTOR));

                        txtDebugEl.nativeElement.dispatchEvent(e);
                        fixture.detectChanges();
                        tick(THROTTLE);

                        expect(handlerSpy).toHaveBeenCalled();
                        expect(handlerSpy).toHaveBeenCalledTimes(3);

                        ev = handlerSpy.calls.mostRecent().returnValue;
                        expect(ev.constructor).toBe(MouseEvent);
                        expect(ev.target).toBe(txtDebugEl.nativeElement);
                    }));
                });
            });

            describe(`Scenario: on decorated container`, () => {
                describe('Context: self', () => {
                    it('should NOT emit when ${e.type}-ing the container', () => {
                        fixture.detectChanges();

                        const containerDgbEl = fixture.debugElement.query(By.css(`#${CONTAINER_ID}`));
                        containerDgbEl.nativeElement.dispatchEvent(e);
                        fixture.detectChanges();

                        expect(handlerSpy).not.toHaveBeenCalled();
                    });
                });

                describe('Context: children', () => {
                    it(`should NOT emit when ${e.type}-ing the button`, () => {
                        fixture.detectChanges();

                        const containerDgbEl = fixture.debugElement.query(By.css(`#${CONTAINER_ID}`));
                        const buttonDbgEl = containerDgbEl.query(By.css(`.${BTN_CLASS}`));

                        buttonDbgEl.nativeElement.dispatchEvent(e);
                        fixture.detectChanges();

                        expect(handlerSpy).not.toHaveBeenCalled();
                    });

                    it(`should NOT emit when ${e.type}-ing the text wrapper`, () => {
                        fixture.detectChanges();

                        const containerDgbEl = fixture.debugElement.query(By.css(`#${CONTAINER_ID}`));
                        const txtWrapperDebugEl = containerDgbEl.query(By.css(`.${TEXT_WRAPPER_CLASS}`));

                        txtWrapperDebugEl.nativeElement.dispatchEvent(e);
                        fixture.detectChanges();

                        expect(handlerSpy).not.toHaveBeenCalled();
                    });

                    it(`should NOT emit when ${e.type}-ing the text`, () => {
                        fixture.detectChanges();

                        const containerDgbEl = fixture.debugElement.query(By.css(`#${CONTAINER_ID}`));
                        const txtDebugEl = containerDgbEl.query(By.css(TEXT_ELEMENT_SELECTOR));

                        txtDebugEl.nativeElement.dispatchEvent(e);
                        fixture.detectChanges();

                        expect(handlerSpy).not.toHaveBeenCalled();
                    });

                    it(`should NOT emit when ${e.type}-ing the ALL the children`, fakeAsync(() => {
                        const THROTTLE = 1000 / 3 + 1;

                        fixture.detectChanges();

                        // BUTTON CLICK
                        const containerDgbEl = fixture.debugElement.query(By.css(`#${CONTAINER_ID}`));

                        const buttonDbgEl = containerDgbEl.query(By.css(`.${BTN_CLASS}`));
                        buttonDbgEl.nativeElement.dispatchEvent(e);
                        fixture.detectChanges();
                        tick(THROTTLE);

                        expect(handlerSpy).not.toHaveBeenCalled();

                        // TEXT WRAPPER CLICK
                        const txtWrapperDebugEl = containerDgbEl.query(By.css(`.${TEXT_WRAPPER_CLASS}`));
                        txtWrapperDebugEl.nativeElement.dispatchEvent(e);
                        fixture.detectChanges();
                        tick(THROTTLE);

                        expect(handlerSpy).not.toHaveBeenCalled();

                        // TEXT CLICK
                        const txtDebugEl = containerDgbEl.query(By.css(TEXT_ELEMENT_SELECTOR));

                        txtDebugEl.nativeElement.dispatchEvent(e);
                        fixture.detectChanges();
                        tick(THROTTLE);

                        expect(handlerSpy).not.toHaveBeenCalled();
                    }));
                });
            });
        });
    });
});

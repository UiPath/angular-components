import {
    Component,
    DebugElement,
} from '@angular/core';
import {
    ComponentFixture,
    fakeAsync,
    TestBed,
    tick,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { UiAutofocusDirective } from './ui-autofocus.directive';

@Component({
    template: `
  <input type="text"
              [uiAutofocus]="autofocusFlag">
  <input type="text"
              [uiAutofocus]="autofocusFlag"
              [refocus]="refocusFlag"/>
  `,
})
class TestAutofocusComponent {
    public autofocusFlag = true;
    public refocusFlag = false;
}

describe('Directive: Autofocus', () => {
    let component: TestAutofocusComponent;
    let fixture: ComponentFixture<TestAutofocusComponent>;
    let focusedInput: DebugElement;
    let refocusedInput: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [
                TestAutofocusComponent,
                UiAutofocusDirective,
            ],
        });
        fixture = TestBed.createComponent(TestAutofocusComponent);
        component = fixture.componentInstance;

        // all elements with an attached AutofocusDirective
        [focusedInput, refocusedInput] = fixture.debugElement.queryAll(By.directive(UiAutofocusDirective));
    });

    afterEach(() => {
        fixture.destroy();
    });

    it('should call the focus event', fakeAsync(() => {
        const directive = focusedInput.injector.get<UiAutofocusDirective>(UiAutofocusDirective);

        spyOn(directive, 'enqueueFocus').and.callThrough();
        spyOn(directive, 'focus').and.callThrough();
        spyOn<any>(directive, '_getFocusableNode').and.callThrough();

        fixture.detectChanges();
        expect(directive.enqueueFocus).toHaveBeenCalledTimes(1);
        expect(directive['_getFocusableNode']).toHaveBeenCalledTimes(0);
        expect(directive.element).toBeUndefined();
        expect(directive.focus).toHaveBeenCalledTimes(0);

        tick();

        expect(directive['_getFocusableNode']).toHaveBeenCalledTimes(1);
        expect(directive.element).not.toBeNull();
        expect(directive.focus).toHaveBeenCalledTimes(1);
    }));

    it('should not call the focus event when autofocus is false', fakeAsync(() => {
        const directive = focusedInput.injector.get<UiAutofocusDirective>(UiAutofocusDirective);
        component.autofocusFlag = false;

        spyOn(directive, 'enqueueFocus').and.callThrough();
        spyOn(directive, 'focus').and.callThrough();
        spyOn<any>(directive, '_getFocusableNode').and.callThrough();

        fixture.detectChanges();
        expect(directive.enqueueFocus).toHaveBeenCalledTimes(1);

        tick();

        expect(directive['_getFocusableNode']).toHaveBeenCalledTimes(0);
        expect(directive.element).toBeUndefined();
        expect(directive.focus).toHaveBeenCalledTimes(0);
    }));

    it('should call the focus event when refocus flag is set', fakeAsync(() => {
        const directive = refocusedInput.injector.get<UiAutofocusDirective>(UiAutofocusDirective);

        spyOn(directive, 'enqueueFocus').and.callThrough();
        spyOn(directive, 'focus').and.callThrough();
        spyOn<any>(directive, '_getFocusableNode').and.callThrough();

        // queue focus
        fixture.detectChanges();
        expect(directive.enqueueFocus).toHaveBeenCalledTimes(1);
        expect(directive.element).toBeUndefined();
        expect(directive['_getFocusableNode']).toHaveBeenCalledTimes(0);
        expect(directive.focus).toHaveBeenCalledTimes(0);

        tick();

        // check focusable element was found and has been focused
        expect(directive['_getFocusableNode']).toHaveBeenCalledTimes(1);
        expect(directive.element).not.toBeNull();
        expect(directive.focus).toHaveBeenCalledTimes(1);

        spyOn(directive.element!, 'focus');
        component.refocusFlag = true;

        // a new 'focus' should be queued after the refocusFlag becomes true
        fixture.detectChanges();
        expect(directive.enqueueFocus).toHaveBeenCalledTimes(2);
        expect(directive.focus).toHaveBeenCalledTimes(1);
        expect(directive.element!.focus).toHaveBeenCalledTimes(0);

        tick();

        // _getFocusableNode should not have been called again, only the 'focus' methods
        expect(directive['_getFocusableNode']).toHaveBeenCalledTimes(1);
        expect(directive.focus).toHaveBeenCalledTimes(2);
        expect(directive.element!.focus).toHaveBeenCalledTimes(1);
    }));

    it('should not call the focus event when refocus flag is set but autofocus is not', fakeAsync(() => {
        const directive = refocusedInput.injector.get<UiAutofocusDirective>(UiAutofocusDirective);
        component.autofocusFlag = false;
        component.refocusFlag = true;

        spyOn(directive, 'focus').and.callThrough();
        spyOn<any>(directive, '_getFocusableNode').and.callThrough();

        fixture.detectChanges();
        expect(directive.element).toBeUndefined();
        expect(directive['_getFocusableNode']).toHaveBeenCalledTimes(0);
        expect(directive.focus).toHaveBeenCalledTimes(0);

        tick();

        expect(directive.element).toBeUndefined();
        expect(directive['_getFocusableNode']).toHaveBeenCalledTimes(0);
        expect(directive.focus).toHaveBeenCalledTimes(0);
    }));
});

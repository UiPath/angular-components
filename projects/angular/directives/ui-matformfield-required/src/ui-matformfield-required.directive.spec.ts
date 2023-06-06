import {
    Component,
    DebugElement,
} from '@angular/core';
import {
    ComponentFixture,
    fakeAsync,
    flush,
    TestBed,
} from '@angular/core/testing';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EventGenerator } from '@uipath/angular/testing';

import { UiMatFormFieldRequiredDirective } from './ui-matformfield-required.directive';
import { UiMatFormFieldRequiredIntl } from './ui-matformfield-required.directive.intl';
import { UiMatFormFieldRequiredModule } from './ui-matformfield-required.module';

@Component({
    template: `
    <div>
        <mat-form-field>
            <input matInput [required]="required" [disabled]="disabled"/>
            <span class="mat-form-field-label-wrapper">
                <label>
                    <span>Some text *</span>
                </label>
            </span>
        </mat-form-field>
    </div>`,
})
class TestMatFormFieldRequiredComponent {
    disabled = false;
    required = true;
}

describe('Directive: MatFormFieldRequired', () => {
    let fixture: ComponentFixture<TestMatFormFieldRequiredComponent>;
    let directiveEl: DebugElement;
    let dir: UiMatFormFieldRequiredDirective;
    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [
                TestMatFormFieldRequiredComponent,
            ],
            imports: [
                UiMatFormFieldRequiredModule,
                MatTooltipModule,
                BrowserAnimationsModule,
                MatFormFieldModule,
                MatInputModule,
            ],
            providers: [
                UiMatFormFieldRequiredIntl,
            ],
        });
        TestBed.inject(UiMatFormFieldRequiredIntl);
        fixture = TestBed.createComponent(TestMatFormFieldRequiredComponent);
        directiveEl = fixture.debugElement
            .query(By.directive(UiMatFormFieldRequiredDirective));
        dir = directiveEl.injector.get(UiMatFormFieldRequiredDirective) as UiMatFormFieldRequiredDirective;
    });

    afterEach(() => {
        fixture.destroy();
    });

    afterAll(() => {
        (dir as any)._disabledClassObserver?.observe$.unsubscribe();
        (dir as any)._requiredAttributeObserver?.observe$.unsubscribe();
    });

    it('Directive gets attached to element', () => {
        fixture.detectChanges();
        expect(directiveEl).not.toBeNull();
    });

    it('MatTooltip should be enabled if input enabled', () => {
        fixture.detectChanges();
        expect((dir as any)._tooltip?.disabled).toBeFalsy();
    });

    it('MatTooltip should be disabled if input disabled', () => {
        fixture.detectChanges();
        expect((dir as any)._tooltip?.disabled).toBeFalsy();
        fixture.componentInstance.disabled = true;
        fixture.detectChanges();
        expect((dir as any)._tooltip?.disabled).toBeTruthy();
    });

    it('MatTooltip should be visible on mouseEnter', fakeAsync(() => {
        fixture.detectChanges();
        const spanDgbEl = fixture.debugElement.query(By.css('span'));
        spanDgbEl.nativeElement.dispatchEvent(EventGenerator.mouseEnter);
        flush();
        expect((dir as any)._tooltip?._isTooltipVisible()).toBeTruthy();
        spanDgbEl.nativeElement.dispatchEvent(EventGenerator.mouseLeave);
        flush();
        expect((dir as any)._tooltip?._isTooltipVisible()).toBeFalsy();
    }));

    it('MatTooltip should NOT exist if input is NOT required', () => {
        fixture.componentInstance.required = false;
        fixture.detectChanges();
        expect((dir as any)._tooltip).toBe(undefined);
    });

    it('MatTooltip should be disabled if input changes to NOT required', fakeAsync(() => {
        fixture.detectChanges();
        fixture.componentInstance.required = false;
        fixture.detectChanges();
        expect((dir as any)._tooltip?.disabled).toBeTruthy();
    }));

    it('MatTooltip should be created and enabled if input changes to required', fakeAsync(() => {
        fixture.componentInstance.required = false;
        fixture.detectChanges();
        expect((dir as any)._tooltip).toBe(undefined);
        fixture.componentInstance.required = true;
        fixture.detectChanges();
        expect((dir as any)._tooltip.disabled).toBeFalsy();
    }));
});

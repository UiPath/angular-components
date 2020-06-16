import {
    Component,
    Injectable,
    ViewChild,
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
} from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { EventGenerator } from '@uipath/angular/testing';

import * as faker from 'faker';
import { take } from 'rxjs/operators';

import { UiPasswordToggleComponent } from './ui-password-toggle.component';
import { UiPasswordToggleIntl } from './ui-password-toggle.intl';
import { UiPasswordToggleModule } from './ui-password-toggle.module';

@Component({
    template: `
        <input #input
                [value]="password"
                matInput
                type="password"
                class="form-control" />
            <ui-password-toggle [element]="input"
                                [disabled]="disabled"
                                matSuffix>
             </ui-password-toggle>
    `,
})
class TestHostComponent {
    @ViewChild(UiPasswordToggleComponent, {
        static: true,
    })
    public toggle!: UiPasswordToggleComponent;

    public disabled?: boolean;

    public password = '';
}

@Injectable()
export class TestPasswordToggleIntl extends UiPasswordToggleIntl {
    public originalTooltipHide = this.tooltipHide;
    public originalTooltipShow = this.tooltipShow;

    public translatedTooltipHide = faker.lorem.word();
    public translatedTooltipShow = faker.lorem.word();

    public changeLabels() {
        this.tooltipHide = this.translatedTooltipHide;
        this.tooltipShow = this.translatedTooltipShow;

        this.changes.next();
    }
}

describe('Component: UiPasswordToggle', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let component: TestHostComponent;
    let intl: TestPasswordToggleIntl;
    let toggleButton: HTMLButtonElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                FormsModule,
                UiPasswordToggleModule,
            ],
            declarations: [
                TestHostComponent,
            ],
            providers: [
                {
                    provide: UiPasswordToggleIntl,
                    useClass: TestPasswordToggleIntl,
                },
            ],
        });

        intl = TestBed.inject(UiPasswordToggleIntl) as TestPasswordToggleIntl;

        fixture = TestBed.createComponent(TestHostComponent);
        component = fixture.componentInstance;
        toggleButton = fixture.debugElement
            .query(By.css('button'))
            .nativeElement;

        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
    });

    describe('State: initial', () => {
        it('should create component', () => {
            expect(component).toBeDefined();
        });

        it('should have the toggle enabled', () => {
            expect(toggleButton).not.toBeDisabled();
        });
    });

    it('should toggle the input type from text <-> password and password <-> text', () => {
        component.password = faker.internet.password();
        fixture.detectChanges();

        const input = fixture.debugElement
            .query(By.css('input'));

        toggleButton.dispatchEvent(EventGenerator.click);
        fixture.detectChanges();

        expect(input.nativeElement).toHaveAttr('type', 'text');

        toggleButton.dispatchEvent(EventGenerator.click);
        fixture.detectChanges();

        expect(input.nativeElement).toHaveAttr('type', 'password');

        toggleButton.dispatchEvent(EventGenerator.click);
        fixture.detectChanges();

        expect(input.nativeElement).toHaveAttr('type', 'text');
    });

    it('should update the show tooltip if the intl emits changes', async () => {
        const show = await component.toggle.tooltip$.pipe(take(1)).toPromise();

        expect(show).toEqual(intl.originalTooltipShow);
        fixture.detectChanges();
        expect(toggleButton).toHaveAttr('aria-label', intl.originalTooltipShow);

        intl.changeLabels();

        const translatedShow = await component.toggle.tooltip$.pipe(take(1)).toPromise();

        expect(translatedShow).toEqual(intl.translatedTooltipShow);
        fixture.detectChanges();
        expect(toggleButton).toHaveAttr('aria-label', intl.translatedTooltipShow);
    });

    it('should update the hide tooltip if the intl emits changes', async () => {
        toggleButton.dispatchEvent(EventGenerator.click);

        const hide = await component.toggle.tooltip$.pipe(take(1)).toPromise();

        expect(hide).toEqual(intl.originalTooltipHide);
        fixture.detectChanges();
        expect(toggleButton).toHaveAttr('aria-label', intl.originalTooltipHide);

        intl.changeLabels();

        const translatedHide = await component.toggle.tooltip$.pipe(take(1)).toPromise();

        expect(translatedHide).toEqual(intl.translatedTooltipHide);
        fixture.detectChanges();
        expect(toggleButton).toHaveAttr('aria-label', intl.translatedTooltipHide);
    });

    it('should throw if no input is provided', () => {
        expect(() => {
            TestBed.overrideTemplate(TestHostComponent, `
                    <ui-password-toggle
                                        [element]="input"
                                        matSuffix>
                    </ui-password-toggle>
                `);

            const invalidFixture = TestBed.createComponent(TestHostComponent);
            invalidFixture.detectChanges();
        }).toThrow();
    });

    it('should disable the button', () => {
        component.disabled = true;
        fixture.detectChanges();

        expect(toggleButton).toBeDisabled();
    });

    it('should NOT disable the button', () => {
        component.disabled = false;
        fixture.detectChanges();

        expect(toggleButton).not.toBeDisabled();
    });
});

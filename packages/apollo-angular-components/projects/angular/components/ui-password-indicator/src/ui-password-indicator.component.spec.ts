import {
    Component,
    DebugElement,
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
} from '@angular/core/testing';
import {
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBar } from '@angular/material/progress-bar';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { UiPasswordIndicatorComponent } from './ui-password-indicator.component';
import { UiPasswordComplexityIntl } from './ui-password-indicator.intl';
import { UiPasswordIndicatorModule } from './ui-password-indicator.module';
import { complexityValidator } from './ui-password-indicator.validator';

const enum Rule {
    length = 'length',
    upperCase = 'upperCase',
    lowerCase = 'lowerCase',
    dollarOrAt = 'dollarOrAt',
}

@Component({
    template: `
        <form [formGroup]="form">
            <mat-form-field>
            <input #passwordInput
                    matInput
                    placeholder="Password"
                    formControlName="password"
                    name="password"
                    autocomplete="off"
                    type="text" />
            <ui-password-indicator [control]="form.get('password')"
                                   [passwordRules]="rules"
                                   [hideValidRuleDefinition]="hideValidRuleDefinition">
            </ui-password-indicator>
            </mat-form-field>
        </form>
    `,
})
export class PasswordIndicatorTestComponent {
    public rules = {
        [Rule.length]: (value: string) => value.length > 8,
        [Rule.upperCase]: /(?=.*[A-Z])/,
        [Rule.lowerCase]: /(?=.*[a-z])/,
        [Rule.dollarOrAt]: /(?=.*[$@])/,
    };

    public form: FormGroup;

    public hideValidRuleDefinition = false;

    public setValue(value: string) {
        const password = this.form.get('password')!;
        password.markAsDirty();
        password!.setValue(value);
    }

    constructor(fb: FormBuilder) {
        this.form = fb.group({
            password: [
                '',
                complexityValidator(this.rules, false),
            ],
        });
    }
}

describe('Component: UiPasswordIndicator', () => {
    let fixture: ComponentFixture<PasswordIndicatorTestComponent>;
    let component: PasswordIndicatorTestComponent;

    const getIndicator = () =>
        fixture
            .debugElement
            .query(By.directive(UiPasswordIndicatorComponent));

    const getRules = (indicator: DebugElement) =>
        indicator
            .queryAll(By.css('.ui-password-rule'));

    const getLabel = (rule: DebugElement) =>
        rule.query(By.css('.ui-password-rule-label'));

    const getRuleByKey = (indicator: DebugElement, key: string) =>
        indicator
            .query(By.css(`[data-rule-name=${key}]`));

    const getProgress = (indicator: DebugElement): MatProgressBar =>
        indicator.query(By.directive(MatProgressBar)).componentInstance;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                FormsModule,
                ReactiveFormsModule,
                NoopAnimationsModule,
                UiPasswordIndicatorModule,
                MatFormFieldModule,
                MatInputModule,
            ],
            declarations: [PasswordIndicatorTestComponent],
        });

        fixture = TestBed.createComponent(PasswordIndicatorTestComponent);
        component = fixture.componentInstance;

        fixture.detectChanges();
    });

    it('should create component', () => {
        expect(component).toBeDefined();
    });

    describe('State: valid', () => {
        it('should hide all the rules', () => {
            component.setValue('aB@123456');
            fixture.detectChanges();

            const indicator = getIndicator();
            const labels = getRules(indicator);
            expect(labels).toBeEmptyArray();
        });
    });

    describe('Rule Behavior: mark valid rules', () => {
        describe('State: Invalid', () => {
            it('should display all the invalid rules', () => {
                component.setValue('!');
                fixture.detectChanges();

                const indicator = getIndicator();

                const ruleList = getRules(indicator);

                const ruleKeys = Object.keys(component.rules);

                expect(ruleList).toBeArrayOfSize(ruleKeys.length);

                const intl: UiPasswordComplexityIntl = TestBed.inject(UiPasswordComplexityIntl);

                ruleList.forEach((rule, idx) => {
                    const ruleKey = ruleKeys[idx];
                    expect(rule.nativeElement).toHaveAttr('data-rule-name', ruleKey);
                    expect(rule.nativeElement).toHaveClass('ui-password-rule-invalid');

                    const label = getLabel(rule);
                    expect(label.nativeElement).toHaveText(intl.ruleLabel(ruleKey));
                });
            });

            it('should mark valid rules with the correct class', () => {
                component.setValue('a');
                fixture.detectChanges();

                const indicator = getIndicator();

                const lowerCaseRule = getRuleByKey(indicator, Rule.lowerCase);
                const upperCaseRule = getRuleByKey(indicator, Rule.upperCase);
                const atRule = getRuleByKey(indicator, Rule.dollarOrAt);
                const lengthRule = getRuleByKey(indicator, Rule.length);

                expect(lowerCaseRule.nativeElement).toHaveClass('ui-password-rule-valid');
                expect(upperCaseRule.nativeElement).toHaveClass('ui-password-rule-invalid');
                expect(atRule.nativeElement).toHaveClass('ui-password-rule-invalid');
                expect(lengthRule.nativeElement).toHaveClass('ui-password-rule-invalid');

                component.setValue('aB');
                fixture.detectChanges();

                expect(lowerCaseRule.nativeElement).toHaveClass('ui-password-rule-valid');
                expect(upperCaseRule.nativeElement).toHaveClass('ui-password-rule-valid');
                expect(atRule.nativeElement).toHaveClass('ui-password-rule-invalid');
                expect(lengthRule.nativeElement).toHaveClass('ui-password-rule-invalid');

                component.setValue('aB@');
                fixture.detectChanges();

                expect(lowerCaseRule.nativeElement).toHaveClass('ui-password-rule-valid');
                expect(upperCaseRule.nativeElement).toHaveClass('ui-password-rule-valid');
                expect(atRule.nativeElement).toHaveClass('ui-password-rule-valid');
                expect(lengthRule.nativeElement).toHaveClass('ui-password-rule-invalid');
            });

            it('should have progress 0 if no rule is valid', () => {
                component.setValue('!');
                fixture.detectChanges();

                const progress = getProgress(getIndicator());

                expect(progress.value).toEqual(0);
            });

            it('should update the progress as the strength increases', () => {
                component.setValue('!');
                fixture.detectChanges();

                const increment = 100 / Object.keys(component.rules).length;

                const progress = getProgress(getIndicator());

                expect(progress.value).toEqual(0);

                component.setValue('a');
                fixture.detectChanges();

                expect(progress.value).toEqual(increment);

                component.setValue('aB');
                fixture.detectChanges();

                expect(progress.value).toEqual(increment * 2);

                component.setValue('aB@');
                fixture.detectChanges();

                expect(progress.value).toEqual(increment * 3);
            });
        });
    });

    describe('Rule Behavior: hide valid rules', () => {
        beforeEach(() => {
            component.hideValidRuleDefinition = true;
            fixture.detectChanges();
        });

        describe('State: Invalid', () => {
            it('should hide the rules as they become valid', () => {
                component.setValue('a');
                fixture.detectChanges();

                const indicator = getIndicator();
                let lowerCaseRule = getRuleByKey(indicator, Rule.lowerCase);
                let upperCaseRule = getRuleByKey(indicator, Rule.upperCase);
                let atRule = getRuleByKey(indicator, Rule.dollarOrAt);
                let lengthRule = getRuleByKey(indicator, Rule.length);

                expect(lowerCaseRule).toBeNull();
                expect(upperCaseRule.nativeElement).toBeDefined();
                expect(atRule.nativeElement).toBeDefined();
                expect(lengthRule.nativeElement).toBeDefined();

                component.setValue('aB');
                fixture.detectChanges();

                lowerCaseRule = getRuleByKey(indicator, Rule.lowerCase);
                upperCaseRule = getRuleByKey(indicator, Rule.upperCase);
                atRule = getRuleByKey(indicator, Rule.dollarOrAt);
                lengthRule = getRuleByKey(indicator, Rule.length);

                expect(lowerCaseRule).toBeNull();
                expect(upperCaseRule).toBeNull();
                expect(atRule.nativeElement).toBeDefined();
                expect(lengthRule.nativeElement).toBeDefined();

                component.setValue('aB@');
                fixture.detectChanges();

                lowerCaseRule = getRuleByKey(indicator, Rule.lowerCase);
                upperCaseRule = getRuleByKey(indicator, Rule.upperCase);
                atRule = getRuleByKey(indicator, Rule.dollarOrAt);
                lengthRule = getRuleByKey(indicator, Rule.length);

                expect(lowerCaseRule).toBeNull();
                expect(upperCaseRule).toBeNull();
                expect(atRule).toBeNull();
                expect(lengthRule.nativeElement).toBeDefined();
            });
        });
    });
});

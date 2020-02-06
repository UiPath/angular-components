import {
    Component,
    DebugElement,
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
} from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { SpinnerButtonClass } from './ui-spinner-button.directive';
import { UiSpinnerButtonModule } from './ui-spinner-button.module';

@Component({
    template: '',
})
export class SpinnerButtonFixtureComponent {
    public loading = false;
    public color: MatProgressSpinner['color'] = 'accent';
    public mode: MatProgressSpinner['mode'] = 'indeterminate';
    public value: MatProgressSpinner['value'] = 0;
}

const enum ButtonType {
    MatIconButton = 'mat-icon-button',
    MatMiniFab = 'mat-mini-fab',
    MatFab = 'mat-fab',
    MatButton = 'mat-button',
    MatFlatButotn = 'mat-flat-button',
    MatRaisedButton = 'mat-raised-button',
    MatStrokedButton = 'mat-stroked-button',
}

const templateFactory = (type: ButtonType) => `
        <button ${type}
                ui-spinner-button
                [spinnerButtonLoading]="loading"
                [spinnerButtonColor]="color"
                [spinnerButtonValue]="value"
                [spinnerButtonMode]="mode">
            Test me!
        </button>
`;

const describeForButtonType = (type: ButtonType) => {
    describe(`Directive: UiProgressButton [${type}]`, () => {
        let fixture: ComponentFixture<SpinnerButtonFixtureComponent>;
        let component: SpinnerButtonFixtureComponent;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [
                    UiSpinnerButtonModule,
                    MatButtonModule,
                    NoopAnimationsModule,
                ],
                declarations: [SpinnerButtonFixtureComponent],
            });

            TestBed.overrideTemplate(SpinnerButtonFixtureComponent, templateFactory(type));

            fixture = TestBed.createComponent(SpinnerButtonFixtureComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        describe('State: initial', () => {
            it('should create the button', () => {
                expect(component).toBeDefined();
            });

            it('should add the identifier class to the button', () => {
                const button = fixture.debugElement.query(By.css('button'));

                expect(button.classes[SpinnerButtonClass.Base]).toBeDefined();
            });
        });

        describe('State: NOT loading', () => {
            let progressDebug: DebugElement;

            beforeEach(() => {
                component.loading = false;
                fixture.detectChanges();
                progressDebug = fixture.debugElement.query(By.directive(MatProgressSpinner));
            });

            it('should not display the progress bar', () => {
                expect(progressDebug).toBeNull();
            });

            it('should NOT add the loading class to the button', () => {
                const button = fixture.debugElement.query(By.css('button'));

                expect(button.classes[SpinnerButtonClass.Loading]).toBeFalsy();
            });
        });

        describe('State: loading', () => {
            let progressDebug: DebugElement;
            let progress: MatProgressSpinner;

            beforeEach(() => {
                component.loading = true;
                fixture.detectChanges();
                progressDebug = fixture.debugElement.query(By.directive(MatProgressSpinner));
                progress = progressDebug.componentInstance;
            });

            it('should add the loading class to the button', () => {
                const button = fixture.debugElement.query(By.css('button'));

                expect(button.classes[SpinnerButtonClass.Loading]).toBeTruthy();
            });

            it('should display the progress bar', () => {
                expect(progressDebug).toBeDefined();
            });

            describe('Input: mode', () => {
                const describeMode = (mode: MatProgressSpinner['mode']) => {
                    component.mode = mode;
                    fixture.detectChanges();
                    expect(progress.mode)
                        .toEqual(mode);
                };

                it('should set the mode to indeterminate', () => {
                    describeMode('indeterminate');
                });

                it('should set the mode to determinate', () => {
                    describeMode('determinate');
                });
            });

            describe('Input: color', () => {
                const describeColor = (color: MatProgressSpinner['color']) => {
                    component.color = color;
                    fixture.detectChanges();
                    expect(progress.color)
                        .toBe(color);
                };

                it('should set the coor to warn', () => {
                    describeColor('warn');
                });

                it('should set the coor to accent', () => {
                    describeColor('accent');
                });

                it('should set the coor to primary', () => {
                    describeColor('primary');
                });
            });

            describe('Input: value', () => {
                beforeEach(() => {
                    component.loading = true;
                    component.mode = 'determinate';
                    component.value = 0;

                    fixture.detectChanges();
                });

                it('should set the progress value to 50', () => {
                    component.value = 50;
                    fixture.detectChanges();
                    expect(progress.value).toEqual(50);
                });

                it('should cycle from 1 to 100', () => {
                    for (let i = 0; i <= 100; i++) {
                        component.value = i;
                        fixture.detectChanges();
                        expect(progress.value).toEqual(i);
                    }
                });
            });
        });
    });
};

describeForButtonType(ButtonType.MatButton);
describeForButtonType(ButtonType.MatFlatButotn);
describeForButtonType(ButtonType.MatRaisedButton);
describeForButtonType(ButtonType.MatStrokedButton);
describeForButtonType(ButtonType.MatFab);
describeForButtonType(ButtonType.MatMiniFab);
describeForButtonType(ButtonType.MatIconButton);


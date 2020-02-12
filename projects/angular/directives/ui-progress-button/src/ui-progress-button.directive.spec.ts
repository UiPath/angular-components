import {
    Component,
    DebugElement,
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
} from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBar } from '@angular/material/progress-bar';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { ButtonProgressClass } from './ui-progress-button.directive';
import { UiProgressButtonModule } from './ui-progress-button.module';

const enum ButtonType {
    MatButton = 'mat-button',
    MatFlatButotn = 'mat-flat-button',
    MatRaisedButton = 'mat-raised-button',
    MatStrokedButton = 'mat-stroked-button',
}

const templateFactory = (type: ButtonType) => `
        <button ${type}
                ui-progress-button
                [progressButtonLoading]="loading"
                [progressButtonColor]="color"
                [progressButtonValue]="value"
                [progressButtonBufferValue]="bufferValue"
                [progressButtonMode]="mode"
        >
            Test me!
        </button>
`;

@Component({
    template: '',
})
export class ProgressButtonFixtureComponent {
    public loading = false;
    public color: MatProgressBar['color'] = 'accent';
    public mode: MatProgressBar['mode'] = 'indeterminate';
    public value: MatProgressBar['value'] = 0;
    public bufferValue: MatProgressBar['bufferValue'] = 0;
}

const describeForButtonType = (type: ButtonType) => {
    describe(`Directive: UiProgressButton [${type}]`, () => {
        let fixture: ComponentFixture<ProgressButtonFixtureComponent>;
        let component: ProgressButtonFixtureComponent;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [
                    UiProgressButtonModule,
                    MatButtonModule,
                    NoopAnimationsModule,
                ],
                declarations: [ProgressButtonFixtureComponent],
            });

            TestBed.overrideTemplate(ProgressButtonFixtureComponent, templateFactory(type));

            fixture = TestBed.createComponent(ProgressButtonFixtureComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        describe('State: initial', () => {
            it('should create the button', () => {
                expect(component).toBeDefined();
            });

            it('should add the identifier class to the button', () => {
                const button = fixture.debugElement.query(By.css('button'));

                expect(button.classes[ButtonProgressClass.Base]).toBeTruthy();
            });
        });

        describe('State: NOT loading', () => {
            let progressDebug: DebugElement;

            beforeEach(() => {
                component.loading = false;
                fixture.detectChanges();
                progressDebug = fixture.debugElement.query(By.directive(MatProgressBar));
            });

            it('should not display the progress bar', () => {
                expect(progressDebug).toBeNull();
            });
        });

        describe('State: loading', () => {
            let progressDebug: DebugElement;
            let progress: MatProgressBar;

            beforeEach(() => {
                component.loading = true;
                fixture.detectChanges();
                progressDebug = fixture.debugElement.query(By.directive(MatProgressBar));
                progress = progressDebug.componentInstance;
            });

            it('should display the progress bar', () => {
                expect(progressDebug).toBeDefined();
            });

            describe('Input: mode', () => {
                const describeMode = (mode: MatProgressBar['mode']) => {
                    component.mode = mode;
                    fixture.detectChanges();
                    expect(progress.mode)
                        .toEqual(mode);
                };

                it('should set the mode to query', () => {
                    describeMode('query');
                });

                it('should set the mode to indeterminate', () => {
                    describeMode('indeterminate');
                });

                it('should set the mode to determinate', () => {
                    describeMode('determinate');
                });

                it('should set the mode to buffer', () => {
                    describeMode('buffer');
                });
            });

            describe('Input: color', () => {
                const describeColor = (color: MatProgressBar['color']) => {
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
                    const spy = spyOn(progress, '_primaryTransform');

                    for (let i = 0; i <= 100; i++) {
                        component.value = i;
                        fixture.detectChanges();
                        expect(progress.value).toEqual(i);
                    }

                    expect(spy).toHaveBeenCalledTimes(100);
                });
            });

            describe('Input: bufferValue', () => {
                beforeEach(() => {
                    component.loading = true;
                    component.mode = 'buffer';
                    component.value = 0;

                    fixture.detectChanges();
                });

                it('should set the progress value to 50', () => {
                    component.bufferValue = 50;
                    fixture.detectChanges();
                    expect(progress.bufferValue).toEqual(50);
                });

                it('should cycle from 1 to 100', () => {
                    const spy = spyOn(progress, '_bufferTransform');

                    for (let i = 0; i <= 100; i++) {
                        component.bufferValue = i;
                        fixture.detectChanges();
                        expect(progress.bufferValue).toEqual(i);
                    }

                    expect(spy).toHaveBeenCalledTimes(100);
                });
            });
        });
    });
};

describeForButtonType(ButtonType.MatButton);
describeForButtonType(ButtonType.MatFlatButotn);
describeForButtonType(ButtonType.MatRaisedButton);
describeForButtonType(ButtonType.MatStrokedButton);

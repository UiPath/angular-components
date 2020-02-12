import { CommonModule } from '@angular/common';
import {
    Component,
    DebugElement,
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
} from '@angular/core/testing';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { By } from '@angular/platform-browser';

import { BehaviorSubject } from 'rxjs';

import { UiContentSpinnerComponent } from './internal/ui-content-spinner.component';
import { UiContentLoaderModule } from './ui-content-loader.module';

@Component({
    template: `
        <div class="test-container">
            <ng-container *uiContentLoading="
                                                loading$ | async;
                                                color: color;
                                                mode: mode;
                                                value: value;
                                                diameter: diameter;
                                            ">
                <button>I am a button!</button>
            </ng-container>
        </div>
    `,
})
export class LoaderFixtureComponent {
    public loading$ = new BehaviorSubject(false);
    public color?: MatProgressSpinner['color'];
    public mode?: MatProgressSpinner['mode'];
    public value?: MatProgressSpinner['value'];
    public diameter?: MatProgressSpinner['diameter'];
}

describe('Directive: *uiContentLoading', () => {
    let fixture: ComponentFixture<LoaderFixtureComponent>;
    let component: LoaderFixtureComponent;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                CommonModule,
                UiContentLoaderModule,
            ],
            declarations: [LoaderFixtureComponent],
        });

        fixture = TestBed.createComponent(LoaderFixtureComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        fixture.detectChanges();
        expect(fixture.componentInstance).toBeDefined();
    });

    describe('State: loading', () => {
        let progressDebug: DebugElement;
        let progress: MatProgressSpinner;

        beforeEach(() => {
            component.loading$.next(true);
            fixture.detectChanges();
            progressDebug = fixture.debugElement.query(By.directive(MatProgressSpinner));
            progress = progressDebug.componentInstance;
        });

        it('should display the spinner', () => {
            const spinner = fixture.debugElement.query(By.css('.mat-spinner'));

            expect(spinner).toBeDefined();
            expect(progress.color).toBeDefined();
            expect(progress.mode).toBeDefined();
        });

        it('should NOT display the button', () => {
            const button = fixture.debugElement.query(By.css('button'));

            expect(button).toBeNull();
        });

        it('should show the content after loading is done', () => {
            component.loading$.next(false);
            fixture.detectChanges();

            const spinner = fixture.debugElement.query(By.css('.mat-spinner'));
            const button = fixture.debugElement.query(By.css('button'));

            expect(spinner).toBeNull();
            expect(button).toBeDefined();
        });

        describe('Input: diameter', () => {
            it('should update the diameter and position (start = 10; end = 250; increment = 8)', () => {
                for (let diameter = 10; diameter < 250; diameter += 8) {
                    component.diameter = diameter;
                    fixture.detectChanges();
                    expect(progress.diameter).toEqual(diameter);

                    const half = diameter / 2;
                    const element: HTMLElement = progressDebug.nativeElement;
                    const container: HTMLElement = fixture.debugElement
                        .query(By.directive(UiContentSpinnerComponent))
                        .nativeElement;

                    expect(container.style.minHeight).toEqual(`${diameter * 2.5}px`);
                    expect(element.style.top).toEqual(`calc(50% - ${half}px)`);
                    expect(element.style.left).toEqual(`calc(50% - ${half}px)`);
                }
            });
        });

        describe('Input: color', () => {
            const describeColor = (color: MatProgressSpinner['color']) => {
                component.color = color;
                fixture.detectChanges();
                expect(progress.color)
                    .toBe(color);
            };

            it('should set the color to warn', () => {
                describeColor('warn');
            });

            it('should set the color to accent', () => {
                describeColor('accent');
            });

            it('should set the color to primary', () => {
                describeColor('primary');
            });
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

        describe('Input: value', () => {
            beforeEach(() => {
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

    describe('State: NOT loading', () => {
        beforeEach(() => {
            component.loading$.next(false);
            fixture.detectChanges();
        });

        it('should NOT display the spinner', () => {
            const spinner = fixture.debugElement.query(By.css('.mat-spinner'));

            expect(spinner).toBeNull();
        });

        it('should display the button', () => {
            const button = fixture.debugElement.query(By.css('button'));

            expect(button).toBeDefined();
        });

        it('should hide the content when loading starts', () => {
            component.loading$.next(true);
            fixture.detectChanges();

            const spinner = fixture.debugElement.query(By.css('.mat-spinner'));
            const button = fixture.debugElement.query(By.css('button'));

            expect(spinner).toBeDefined();
            expect(button).toBeNull();
        });
    });
});

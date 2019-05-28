import {
  Component,
  ViewChild,
} from '@angular/core';
import {
  async,
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import * as moment from 'moment';
import { BehaviorSubject } from 'rxjs';

import {
  ISecondFormatOptions,
  UI_SECONDFORMAT_OPTIONS,
  UiSecondFormatDirective,
} from './ui-secondformat.directive';

@Component({
    selector: `ui-host-component`,
    template: `<ui-secondformat [seconds]="seconds"></ui-secondformat>`,
})
class TestHostComponent {
    public seconds?: number;

    @ViewChild(UiSecondFormatDirective)
    public uiSecondFormat!: UiSecondFormatDirective;
}

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe('Directive: UiSecondFormat', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let component: TestHostComponent;
    const options: ISecondFormatOptions = {
        redraw$: new BehaviorSubject<void>(void 0),
    };

    beforeEach(async(() => {
        moment.locale('en');

        TestBed.configureTestingModule({
            declarations: [
                UiSecondFormatDirective,
                TestHostComponent,
            ],
            providers: [
                {
                    provide: UI_SECONDFORMAT_OPTIONS,
                    useValue: options,
                },
            ],
        });

        fixture = TestBed.createComponent(TestHostComponent);
        component = fixture.componentInstance;
    }));

    afterEach(() => {
        fixture.destroy();
        moment.locale('en');
    });

    it('should create', () => {
        expect(component.uiSecondFormat).toBeDefined();
    });

    it('should remain empty for null values', () => {
        fixture.detectChanges();

        const text = fixture.debugElement.query(By.directive(UiSecondFormatDirective));

        expect(text.nativeElement.innerHTML.trim()).toBe('');
    });

    describe('language: english', () => {
        it('should return correctly display 2 days 3 hours 1 minutes 3 seconds', () => {
            const days = 2 * DAY;
            const hours = 3 * HOUR;
            const minutes = 1 * MINUTE;
            const seconds = 3;

            component.seconds = days + hours + minutes + seconds;

            fixture.detectChanges();

            const text = fixture.debugElement.query(By.directive(UiSecondFormatDirective));

            expect(text.nativeElement.innerHTML.trim())
                .toBe('2 days 3 hours a minute 3 seconds');
        });

        it('should return correctly display a day an hour a minute 1 seconds', () => {
            const days = DAY;
            const hours = HOUR;
            const minutes = MINUTE;
            const seconds = 1;

            component.seconds = days + hours + minutes + seconds;

            fixture.detectChanges();

            const text = fixture.debugElement.query(By.directive(UiSecondFormatDirective));

            expect(text.nativeElement.innerHTML.trim())
                .toBe('a day an hour a minute 1 seconds');
        });

        it('should display 0 seconds if the total amount of seconds is 0', () => {
            component.seconds = 0;

            fixture.detectChanges();

            const text = fixture.debugElement.query(By.directive(UiSecondFormatDirective));

            expect(text.nativeElement.innerHTML.trim())
                .toBe('0 seconds');
        });

        Array(60).fill(0).map(() => Math.random())
            .forEach((value, seconds) => {
                it(`should display ${(seconds + value).toFixed(2)} seconds if the total amount of seconds is ${seconds + value}`, () => {
                    component.seconds = seconds + value;

                    fixture.detectChanges();

                    const text = fixture.debugElement.query(By.directive(UiSecondFormatDirective));

                    const expectedValue = (seconds + value).toFixed(2);

                    expect(text.nativeElement.innerHTML.trim())
                        .toBe(`${expectedValue} seconds`);
                });
            });

        it('should NOT display 0 seconds if the total amount of seconds is 60', () => {
            component.seconds = MINUTE;

            fixture.detectChanges();

            const text = fixture.debugElement.query(By.directive(UiSecondFormatDirective));

            expect(text.nativeElement.innerHTML.trim())
                .toBe('a minute');
        });

        it('should display a minute', () => {
            component.seconds = MINUTE;

            fixture.detectChanges();

            const text = fixture.debugElement.query(By.directive(UiSecondFormatDirective));

            expect(text.nativeElement.innerHTML.trim())
                .toBe('a minute');
        });

        it('should display 3 minutes', () => {
            component.seconds = 3 * MINUTE;

            fixture.detectChanges();

            const text = fixture.debugElement.query(By.directive(UiSecondFormatDirective));

            expect(text.nativeElement.innerHTML.trim())
                .toBe('3 minutes');
        });

        it('should display an hour', () => {
            component.seconds = HOUR;

            fixture.detectChanges();

            const text = fixture.debugElement.query(By.directive(UiSecondFormatDirective));

            expect(text.nativeElement.innerHTML.trim())
                .toBe('an hour');
        });

        it('should display 3 hours', () => {
            component.seconds = 3 * HOUR;

            fixture.detectChanges();

            const text = fixture.debugElement.query(By.directive(UiSecondFormatDirective));

            expect(text.nativeElement.innerHTML.trim())
                .toBe('3 hours');
        });

        it('should display a day', () => {
            component.seconds = DAY;

            fixture.detectChanges();

            const text = fixture.debugElement.query(By.directive(UiSecondFormatDirective));

            expect(text.nativeElement.innerHTML.trim())
                .toBe('a day');
        });

        it('should display 2 days', () => {
            component.seconds = 2 * DAY;

            fixture.detectChanges();

            const text = fixture.debugElement.query(By.directive(UiSecondFormatDirective));

            expect(text.nativeElement.innerHTML.trim())
                .toBe('2 days');
        });
    });

    describe('language: japanese', () => {
        beforeEach(() => {
            moment.locale('ja');
        });

        Array(60).fill(0).map(() => Math.random())
            .forEach((value, seconds) => {
                it(`should display ${(seconds + value).toFixed(2)} seconds if the total amount of seconds is ${seconds + value}`, () => {
                    component.seconds = seconds + value;

                    fixture.detectChanges();

                    const text = fixture.debugElement.query(By.directive(UiSecondFormatDirective));

                    const expectedValue = (seconds + value).toFixed(2);

                    expect(text.nativeElement.innerHTML.trim())
                        .toBe(`${expectedValue}秒`);
                });
            });

        it('should return correctly display 2 days 3 hours 1 minutes 3 seconds', () => {
            const days = 2 * DAY;
            const hours = 3 * HOUR;
            const minutes = 1 * MINUTE;
            const seconds = 3;

            component.seconds = days + hours + minutes + seconds;

            fixture.detectChanges();

            const text = fixture.debugElement.query(By.directive(UiSecondFormatDirective));

            expect(text.nativeElement.innerHTML.trim())
                .toBe('2日 3時間 1分 3秒');
        });

        it('should return correctly display a day an hour a minute 1 seconds', () => {
            const days = DAY;
            const hours = HOUR;
            const minutes = MINUTE;
            const seconds = 1;

            component.seconds = days + hours + minutes + seconds;

            fixture.detectChanges();

            const text = fixture.debugElement.query(By.directive(UiSecondFormatDirective));

            expect(text.nativeElement.innerHTML.trim())
                .toBe('1日 1時間 1分 1秒');
        });
    });

    describe('language: russian', () => {
        beforeEach(() => {
            moment.locale('ru');
        });

        Array(60).fill(0).map(() => Math.random())
            .forEach((value, seconds) => {
                it(`should display ${(seconds + value).toFixed(2)} seconds if the total amount of seconds is ${seconds + value}`, () => {
                    component.seconds = seconds + value;

                    fixture.detectChanges();

                    const text = fixture.debugElement.query(By.directive(UiSecondFormatDirective));

                    const expectedValue = (seconds + value).toFixed(2);

                    expect(text.nativeElement.innerHTML.trim())
                        .toBe(`${expectedValue} ${
                            // why? because 🇷🇺 👾...
                            [2, 3, 22, 23, 32, 33, 42, 43, 52, 53]
                                .includes(seconds) ? 'секунды' : 'секунд'
                            }`);
                });
            });

        it('should return correctly display 2 days 3 hours 1 minutes 3 seconds', () => {
            const days = 2 * DAY;
            const hours = 3 * HOUR;
            const minutes = 1 * MINUTE;
            const seconds = 3;

            component.seconds = days + hours + minutes + seconds;

            fixture.detectChanges();

            const text = fixture.debugElement.query(By.directive(UiSecondFormatDirective));

            expect(text.nativeElement.innerHTML.trim())
                .toBe('2 дня 3 часа 1 минута 3 секунды');
        });

        it('should return correctly display a day an hour a minute 1 seconds', () => {
            const days = DAY;
            const hours = HOUR;
            const minutes = MINUTE;
            const seconds = 1;

            component.seconds = days + hours + minutes + seconds;

            fixture.detectChanges();

            const text = fixture.debugElement.query(By.directive(UiSecondFormatDirective));

            expect(text.nativeElement.innerHTML.trim())
                .toBe('день час 1 минута 1 секунда');
        });
    });
});

import { BehaviorSubject } from 'rxjs';

import {
    Component,
    ViewChild,
} from '@angular/core';
import {
    ComponentFixture,
    discardPeriodicTasks,
    fakeAsync,
    TestBed,
    tick,
    waitForAsync,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import {
 DateTime,
 DateTimeFormatOptions,
 Settings,
} from 'luxon';
import { USE_LUXON } from '@uipath/angular/utilities';
import {
    DisplayType,
    IDateFormatOptions,
    resolveTimezone,
    UiDateFormatDirective,
    UI_DATEFORMAT_OPTIONS,
} from './ui-dateformat.directive';

const defaultDateFormat = DateTime.DATETIME_SHORT;
const referenceFormatLongDateFormatKey = DateTime.DATETIME_FULL;
const updatedTimezone = 'Europe/London';

@Component({
    selector: `ui-host-component`,
    template: `<ui-dateformat [date]="date"></ui-dateformat>`,
})
class TestHostComponent {
    date?: Date | string;
    dateFormat?: DateTimeFormatOptions;
    timezone?: string;
    contentType?: DisplayType;
    titleType?: DisplayType;

    @ViewChild(UiDateFormatDirective, {
        static: true,
    })
    uiDateFormat!: UiDateFormatDirective;
}

describe('Directive: UiDateFormat with luxon', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let component: TestHostComponent;
    let referenceDate: Date;
    let inputDate: DateTime;
    let options: IDateFormatOptions;
    const beforeConfig = (optionsConfig: IDateFormatOptions) => {
        options = optionsConfig;

        Settings.defaultLocale = 'en';

        inputDate = DateTime
            .now()
            .setZone(resolveTimezone(options));
        referenceDate = inputDate.toJSDate();

        TestBed.configureTestingModule({
            declarations: [
                UiDateFormatDirective,
                TestHostComponent,
            ],
            providers: [
                {
                    provide: UI_DATEFORMAT_OPTIONS,
                    useValue: options,
                },
                {
                    provide: USE_LUXON,
                    useValue: true,
                },
            ],
        });
    };

    afterEach(() => {
        fixture.destroy();
        Settings.defaultLocale = 'en';
    });

    describe('Generic injection token:', () => {
        beforeEach(waitForAsync(() => beforeConfig({
            timezone: 'Europe/Bucharest',
            redraw$: new BehaviorSubject<void>(void 0),
            format: defaultDateFormat,
        })));

        it('should create', () => {
            fixture = TestBed.createComponent(TestHostComponent);

            component = fixture.componentInstance;

            expect(component.uiDateFormat).toBeDefined();
        });

        it('should format the absolute date in the default format', () => {
            fixture = TestBed.createComponent(TestHostComponent);

            component = fixture.componentInstance;
            component.date = referenceDate;

            fixture.detectChanges();

            const formattedDateText = fixture
                .debugElement
                .query(
                    By.css('ui-dateformat'),
                )
                .nativeElement
                .innerText
                .trim();

            expect(formattedDateText).toEqual(inputDate.toLocaleString(defaultDateFormat));
        });

        it('should format the absolute date in the specified format', () => {
            fixture = TestBed
                .overrideComponent(TestHostComponent, {
                    set: {
                        template: `<ui-dateformat [date]="date"
                                                [dateFormat]="dateFormat"></ui-dateformat>`,
                    },
                })
                .createComponent(TestHostComponent);

            component = fixture.componentInstance;
            component.date = referenceDate;
            component.dateFormat = referenceFormatLongDateFormatKey;

            fixture.detectChanges();

            const formattedDateText = fixture
                .debugElement
                .query(
                    By.css('ui-dateformat'),
                )
                .nativeElement
                .innerText
                .trim();

            expect(formattedDateText).toEqual(inputDate.toLocaleString(referenceFormatLongDateFormatKey));
        });

        it('should format the absolute date in the specified timezone', () => {
            fixture = TestBed
                .overrideComponent(TestHostComponent, {
                    set: {
                        template: `<ui-dateformat [date]="date"
                                                [dateFormat]="dateFormat"
                                                [timezone]="timezone"></ui-dateformat>`,
                    },
                })
                .createComponent(TestHostComponent);

            // Update the input date to the new timezone and check if UiDateFormatDirective returns the same date.
            inputDate = DateTime.fromJSDate(referenceDate, {
                zone: updatedTimezone,
            });

            component = fixture.componentInstance;
            component.date = referenceDate;
            component.dateFormat = referenceFormatLongDateFormatKey;
            component.timezone = updatedTimezone;

            fixture.detectChanges();

            const formattedDateText = fixture
                .debugElement
                .query(
                    By.css('ui-dateformat'),
                )
                .nativeElement
                .innerText
                .trim();

            expect(formattedDateText).toEqual(inputDate.toLocaleString(referenceFormatLongDateFormatKey));
        });

        it('should show the relative time', () => {
            fixture = TestBed
                .overrideComponent(TestHostComponent, {
                    set: {
                        template: `<ui-dateformat [date]="date"
                                                contentType="relative"></ui-dateformat>`,
                    },
                })
                .createComponent(TestHostComponent);

            component = fixture.componentInstance;
            component.date = inputDate.minus({ minutes: 2 }).toJSDate();

            fixture.detectChanges();

            const formattedDateText = fixture
                .debugElement
                .query(
                    By.css('ui-dateformat'),
                )
                .nativeElement
                .innerText
                .trim();

            expect(formattedDateText).toContain('2 minutes ago');
        });

        it('should show the relative time as tooltip', () => {
            fixture = TestBed
                .overrideComponent(TestHostComponent, {
                    set: {
                        template: `<ui-dateformat [date]="date"
                                                titleType="relative"></ui-dateformat>`,
                    },
                })
                .createComponent(TestHostComponent);

            component = fixture.componentInstance;
            component.date = inputDate.minus({ minutes: 2 }).toJSDate();

            fixture.detectChanges();

            const formattedDateText = fixture
                .debugElement
                .query(
                    By.css('ui-dateformat'),
                )
                .nativeElement
                .dataset.title;

            expect(formattedDateText).toContain('2 minutes ago');
        });

        it('should update the relative time when enough time elapses', fakeAsync(() => {
            fixture = TestBed
                .overrideComponent(TestHostComponent, {
                    set: {
                        template: `<ui-dateformat [date]="date"
                                                contentType="relative"></ui-dateformat>`,
                    },
                })
                .createComponent(TestHostComponent);

            component = fixture.componentInstance;
            component.date = inputDate.minus({ seconds: 30 }).toJSDate();

            fixture.detectChanges();

            const textElement = fixture
                .debugElement
                .query(
                    By.css('ui-dateformat'),
                )
                .nativeElement;

            expect(textElement.innerText.trim()).toContain('30 seconds ago');

            tick(30000);
            fixture.detectChanges();

            expect(textElement.innerText.trim()).toContain('1 minute ago');
            discardPeriodicTasks();
        }));

        it('should update the absolute date format when the locale is changed', () => {
            fixture = TestBed
                .overrideComponent(TestHostComponent, {
                    set: {
                        template: `<ui-dateformat [date]="date"
                                                [dateFormat]="dateFormat"></ui-dateformat>`,
                    },
                })
                .createComponent(TestHostComponent);

            component = fixture.componentInstance;
            component.date = referenceDate;
            component.dateFormat = referenceFormatLongDateFormatKey;

            fixture.detectChanges();

            Settings.defaultLocale = 'ja';
            (options.redraw$ as BehaviorSubject<void>).next();

            fixture.detectChanges();

            const textElement = fixture
                .debugElement
                .query(
                    By.css('ui-dateformat'),
                )
                .nativeElement;

            const expectedDateText = inputDate.toLocaleString(
                referenceFormatLongDateFormatKey,
                {
                    locale: 'ja',
                },
            );

            expect(textElement.innerText.trim()).toEqual(expectedDateText);
            expect(textElement.dataset.title.trim()).toEqual(textElement.textContent.trim());
        });

        it('should update the relative time format when the locale is changed', () => {
            fixture = TestBed
                .overrideComponent(TestHostComponent, {
                    set: {
                        template: `<ui-dateformat [date]="date"
                                                contentType="relative"
                                                titleType="relative"></ui-dateformat>`,
                    },
                })
                .createComponent(TestHostComponent);

            component = fixture.componentInstance;
            component.date = inputDate.minus({ seconds: 30 }).toJSDate();

            fixture.detectChanges();

            Settings.defaultLocale = 'ja';
            (options.redraw$ as BehaviorSubject<void>).next();

            fixture.detectChanges();

            const textElement = fixture
                .debugElement
                .query(
                    By.css('ui-dateformat'),
                )
                .nativeElement;

            expect(textElement.innerText.trim()).toContain('30 秒前');
            expect(textElement.dataset.title).toContain('30 秒前');
        });

        it('should return the input when it is not a Date object', () => {
            fixture = TestBed.createComponent(TestHostComponent);

            const inputString = 'not a Date object';

            component = fixture.componentInstance;
            component.date = inputString;

            fixture.detectChanges();

            const formattedDateText = fixture
                .debugElement
                .query(
                    By.css('ui-dateformat'),
                )
                .nativeElement
                .innerText
                .trim();

            expect(formattedDateText).toBe(inputString);
        });

        it('should update the shown text when contentType changes', () => {
            fixture = TestBed
                .overrideComponent(TestHostComponent, {
                    set: {
                        template: `<ui-dateformat [date]="date"
                                                [contentType]="contentType"></ui-dateformat>`,
                    },
                })
                .createComponent(TestHostComponent);

            const inputJSDate = inputDate.minus({ seconds: 30 }).toJSDate();
            const expectedAbsoluteDate = DateTime.fromJSDate(inputJSDate)
                .setZone(inputDate.zone)
                .toLocaleString(defaultDateFormat);

            component = fixture.componentInstance;
            component.date = inputJSDate;

            const textElement = fixture
                .debugElement
                .query(
                    By.css('ui-dateformat'),
                )
                .nativeElement;

            // Firstly, check that the date is shown in absolute format.
            component.contentType = 'absolute';

            fixture.detectChanges();

            expect(textElement.innerText.trim()).toEqual(expectedAbsoluteDate);

            // Secondly, check that the format switches to relative when the property changes.
            component.contentType = 'relative';

            fixture.detectChanges();

            expect(textElement.innerText.trim()).toContain('30 seconds ago');

            // Lastly, check that changing from relative to absolute formats the text correctly.
            component.contentType = 'absolute';

            fixture.detectChanges();

            expect(textElement.innerText.trim()).toEqual(expectedAbsoluteDate);
        });

        it('should update the tooltip when titleType changes', () => {
            fixture = TestBed
                .overrideComponent(TestHostComponent, {
                    set: {
                        template: `<ui-dateformat [date]="date"
                                                [titleType]="titleType"></ui-dateformat>`,
                    },
                })
                .createComponent(TestHostComponent);

            const inputJSDate = inputDate.minus({ seconds: 30 }).toJSDate();
            const expectedAbsoluteDate = DateTime.fromJSDate(inputJSDate)
                .setZone(inputDate.zone)
                .toLocaleString(defaultDateFormat);

            component = fixture.componentInstance;
            component.date = inputJSDate;

            const textElement = fixture
                .debugElement
                .query(
                    By.css('ui-dateformat'),
                )
                .nativeElement;

            // Firstly, check that the date is shown in absolute format.
            component.titleType = 'absolute';

            fixture.detectChanges();

            expect(textElement.dataset.title).toEqual(expectedAbsoluteDate);

            // Secondly, check that the format switches to relative when the property changes.
            component.titleType = 'relative';

            fixture.detectChanges();

            expect(textElement.dataset.title).toContain('30 seconds ago');

            // Lastly, check that changing from relative to absolute formats the text correctly.
            component.titleType = 'absolute';

            fixture.detectChanges();

            expect(textElement.dataset.title).toEqual(expectedAbsoluteDate);
        });

        it('should call markForCheck if the date input value changes', fakeAsync(() => {
            fixture = TestBed.createComponent(TestHostComponent);

            component = fixture.componentInstance;
            const changeDetectorRef = (component.uiDateFormat as any)._cd;
            const markForCheckSpy = spyOn(changeDetectorRef, 'markForCheck').and.callThrough();

            const now = Date.now();

            expect(component.date).toEqual(undefined);

            component.date = new Date(now);
            fixture.detectChanges();

            component.date = new Date(now);
            fixture.detectChanges();

            const stringDate = '09/21/2022';
            component.date = stringDate;
            fixture.detectChanges();

            component.date = stringDate;
            fixture.detectChanges();

            component.date = undefined;
            fixture.detectChanges();

            component.date = undefined;
            tick(0);
            fixture.detectChanges();

            expect(markForCheckSpy).toHaveBeenCalledTimes(1);
            discardPeriodicTasks();
        }));
    });

    describe('Configure inputs by setting injection token properties', () => {
        beforeEach(waitForAsync(() => beforeConfig({
            timezone: 'Europe/Bucharest',
            redraw$: new BehaviorSubject<void>(void 0),
            titleType: 'relative',
            contentType: 'relative',
            format: DateTime.DATETIME_SHORT_WITH_SECONDS,
        })));

        it('should show explicit date', () => {
            fixture = TestBed
                .overrideComponent(TestHostComponent, {
                    set: {
                        template: `<ui-dateformat [date]="date"></ui-dateformat>`,
                    },
                })
                .createComponent(TestHostComponent);

            component = fixture.componentInstance;
            component.date = inputDate.minus({ minutes: 2 }).toJSDate();

            fixture.detectChanges();
            const dateformatElement = fixture
                .debugElement
                .query(
                    By.css('ui-dateformat'),
                )
                .nativeElement;
            const formattedDateText = dateformatElement.dataset.title;
            const contentText = dateformatElement.innerText;
            expect(formattedDateText).toContain('2 minutes ago');
            expect(component.uiDateFormat.dateFormat).toEqual(DateTime.DATETIME_SHORT_WITH_SECONDS);
            expect(contentText).toEqual('2 minutes ago');
        });
    });
});

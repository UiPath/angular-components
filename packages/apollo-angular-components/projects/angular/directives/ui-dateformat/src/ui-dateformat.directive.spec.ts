import {
    Component,
    ViewChild,
} from '@angular/core';
import {
    async,
    ComponentFixture,
    discardPeriodicTasks,
    fakeAsync,
    TestBed,
    tick,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import * as moment from 'moment';
import { BehaviorSubject } from 'rxjs';

import {
    DisplayType,
    IDateFormatOptions,
    resolveTimezone,
    UI_DATEFORMAT_OPTIONS,
    UiDateFormatDirective,
} from './ui-dateformat.directive';

const defaultDateFormat = 'L LTS';
const referenceFormatLongDateFormatKey = 'LLLL';
const referenceFormat = 'dddd, MMMM Do, YYYY LT';
const updatedReferenceFormat = 'YYYY年M月D日 dddd LT';
const updatedTimezone = 'Europe/London';

@Component({
    selector: `ui-host-component`,
    template: `<ui-dateformat [date]="date"></ui-dateformat>`,
})
class TestHostComponent {
    public date?: Date | string;
    public dateFormat?: string;
    public timezone?: string;
    public contentType?: DisplayType;
    public titleType?: DisplayType;

    @ViewChild(UiDateFormatDirective, {
        static: true,
    })
    public uiDateFormat!: UiDateFormatDirective;
}

describe('Directive: UiDateFormat', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let component: TestHostComponent;
    let referenceDate: Date;
    let momentInputDate: moment.Moment;
    const options: IDateFormatOptions = {
        timezone: 'Europe/Bucharest',
        redraw$: new BehaviorSubject<void>(void 0),
    };

    beforeEach(async(() => {
        moment.updateLocale('en', {
            longDateFormat: {
                LT: 'h:mm A',
                LTS: 'h:mm:ss A',
                L: 'MM/DD/YYYY',
                LL: 'MMMM D',
                LLL: 'MMMM D, LT',
                LLLL: referenceFormat,
            },
        });

        moment.updateLocale('ja', {
            longDateFormat: {
                LT: 'HH時mm分',
                LTS: 'HH時mm分ss秒',
                L: 'YYYY年M月D日',
                LL: 'M月D日',
                LLL: 'M月D日 LT',
                LLLL: updatedReferenceFormat,
            },
        });

        moment.locale('en');

        momentInputDate = moment()
            .tz(resolveTimezone(options));
        referenceDate = momentInputDate.toDate();

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
            ],
        });
    }));

    afterEach(() => {
        fixture.destroy();
        moment.locale('en');
    });

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

        const momentOutputDate = moment.tz(
            formattedDateText,
            defaultDateFormat,
            resolveTimezone(options),
        );

        expect(momentOutputDate.day()).toEqual(momentInputDate.day());
        expect(momentOutputDate.month()).toEqual(momentInputDate.month());
        expect(momentOutputDate.year()).toEqual(momentInputDate.year());
        expect(momentOutputDate.hour()).toEqual(momentInputDate.hour());
        expect(momentOutputDate.minute()).toEqual(momentInputDate.minute());
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

        const momentOutputDate = moment.tz(
            formattedDateText,
            referenceFormat,
            resolveTimezone(options),
        );

        expect(momentOutputDate.day()).toEqual(momentInputDate.day());
        expect(momentOutputDate.month()).toEqual(momentInputDate.month());
        expect(momentOutputDate.year()).toEqual(momentInputDate.year());
        expect(momentOutputDate.hour()).toEqual(momentInputDate.hour());
        expect(momentOutputDate.minute()).toEqual(momentInputDate.minute());
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
        momentInputDate = moment(referenceDate)
            .tz(updatedTimezone);

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

        const momentOutputDate = moment.tz(
            formattedDateText,
            referenceFormat,
            updatedTimezone,
        );

        expect(momentOutputDate.day()).toEqual(momentInputDate.day());
        expect(momentOutputDate.month()).toEqual(momentInputDate.month());
        expect(momentOutputDate.year()).toEqual(momentInputDate.year());
        expect(momentOutputDate.hour()).toEqual(momentInputDate.hour());
        expect(momentOutputDate.minute()).toEqual(momentInputDate.minute());
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
        component.date = momentInputDate.subtract(2, 'minutes').toDate();

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
        component.date = momentInputDate.subtract(2, 'minutes').toDate();

        fixture.detectChanges();

        const formattedDateText = fixture
            .debugElement
            .query(
                By.css('ui-dateformat'),
            )
            .nativeElement
            .dataset['title'];

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
        component.date = momentInputDate.subtract(30, 'seconds').toDate();

        fixture.detectChanges();

        const textElement = fixture
            .debugElement
            .query(
                By.css('ui-dateformat'),
            )
            .nativeElement;

        expect(textElement.innerText.trim()).toContain('a few seconds ago');

        tick(30000);
        fixture.detectChanges();

        expect(textElement.innerText.trim()).toContain('a minute ago');
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

        moment.locale('ja');
        (options.redraw$ as BehaviorSubject<void>).next();

        fixture.detectChanges();

        const textElement = fixture
            .debugElement
            .query(
                By.css('ui-dateformat'),
            )
            .nativeElement;

        const momentOutputDate = moment.tz(
            textElement.innerText.trim(),
            updatedReferenceFormat,
            resolveTimezone(options),
        );

        expect(momentOutputDate.day()).toEqual(momentInputDate.day());
        expect(momentOutputDate.month()).toEqual(momentInputDate.month());
        expect(momentOutputDate.year()).toEqual(momentInputDate.year());
        expect(momentOutputDate.hour()).toEqual(momentInputDate.hour());
        expect(momentOutputDate.minute()).toEqual(momentInputDate.minute());
        expect(textElement.dataset['title'].trim()).toEqual(textElement.textContent.trim());
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
        component.date = momentInputDate.subtract(30, 'seconds').toDate();

        fixture.detectChanges();

        moment.locale('ja');
        (options.redraw$ as BehaviorSubject<void>).next();

        fixture.detectChanges();

        const textElement = fixture
            .debugElement
            .query(
                By.css('ui-dateformat'),
            )
            .nativeElement;

        expect(textElement.innerText.trim()).toContain('数秒前');
        expect(textElement.dataset['title']).toContain('数秒前');
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

        component = fixture.componentInstance;
        component.date = momentInputDate.subtract(30, 'seconds').toDate();

        const textElement = fixture
            .debugElement
            .query(
                By.css('ui-dateformat'),
            )
            .nativeElement;

        // Firstly, check that the date is shown in absolute format.
        component.contentType = 'absolute';

        fixture.detectChanges();

        let momentOutputDate = moment.tz(
            textElement.innerText.trim(),
            defaultDateFormat,
            resolveTimezone(options),
        );

        expect(momentOutputDate.day()).toEqual(momentInputDate.day());
        expect(momentOutputDate.month()).toEqual(momentInputDate.month());
        expect(momentOutputDate.year()).toEqual(momentInputDate.year());
        expect(momentOutputDate.hour()).toEqual(momentInputDate.hour());
        expect(momentOutputDate.minute()).toEqual(momentInputDate.minute());

        // Secondly, check that the format switches to relative when the property changes.
        component.contentType = 'relative';

        fixture.detectChanges();

        expect(textElement.innerText.trim()).toContain('a few seconds ago');

        // Lastly, check that changing from relative to absolute formats the text correctly.
        component.contentType = 'absolute';

        fixture.detectChanges();

        momentOutputDate = moment.tz(
            textElement.innerText.trim(),
            defaultDateFormat,
            resolveTimezone(options),
        );

        expect(momentOutputDate.day()).toEqual(momentInputDate.day());
        expect(momentOutputDate.month()).toEqual(momentInputDate.month());
        expect(momentOutputDate.year()).toEqual(momentInputDate.year());
        expect(momentOutputDate.hour()).toEqual(momentInputDate.hour());
        expect(momentOutputDate.minute()).toEqual(momentInputDate.minute());
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

        component = fixture.componentInstance;
        component.date = momentInputDate.subtract(30, 'seconds').toDate();

        const textElement = fixture
            .debugElement
            .query(
                By.css('ui-dateformat'),
            )
            .nativeElement;

        // Firstly, check that the date is shown in absolute format.
        component.titleType = 'absolute';

        fixture.detectChanges();

        let momentOutputDate = moment.tz(
            textElement.dataset['title'],
            defaultDateFormat,
            resolveTimezone(options),
        );

        expect(momentOutputDate.day()).toEqual(momentInputDate.day());
        expect(momentOutputDate.month()).toEqual(momentInputDate.month());
        expect(momentOutputDate.year()).toEqual(momentInputDate.year());
        expect(momentOutputDate.hour()).toEqual(momentInputDate.hour());
        expect(momentOutputDate.minute()).toEqual(momentInputDate.minute());

        // Secondly, check that the format switches to relative when the property changes.
        component.titleType = 'relative';

        fixture.detectChanges();

        expect(textElement.dataset['title']).toContain('a few seconds ago');

        // Lastly, check that changing from relative to absolute formats the text correctly.
        component.titleType = 'absolute';

        fixture.detectChanges();

        momentOutputDate = moment.tz(
            textElement.dataset['title'],
            defaultDateFormat,
            resolveTimezone(options),
        );

        expect(momentOutputDate.day()).toEqual(momentInputDate.day());
        expect(momentOutputDate.month()).toEqual(momentInputDate.month());
        expect(momentOutputDate.year()).toEqual(momentInputDate.year());
        expect(momentOutputDate.hour()).toEqual(momentInputDate.hour());
        expect(momentOutputDate.minute()).toEqual(momentInputDate.minute());
    });
});

import {
    BehaviorSubject,
    firstValueFrom,
} from 'rxjs';

import {
    Component,
    ViewChild,
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    waitForAsync,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { Settings } from 'luxon';
import { USE_LUXON } from '@uipath/angular/utilities';
import {
    ISecondFormatOptions,
    UiSecondFormatDirective,
    UI_SECONDFORMAT_OPTIONS,
} from './ui-secondformat.directive';
import { UiSecondFormatModule } from './ui-secondformat.module';

@Component({
    selector: `ui-host-component`,
    template: `<ui-secondformat [seconds]="seconds"></ui-secondformat>`,
})
class TestHostComponent {
    seconds?: number;

    @ViewChild(UiSecondFormatDirective, {
        static: true,
    })
    uiSecondFormat!: UiSecondFormatDirective;
}

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe('Directive: UiSecondFormat with luxon', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let component: TestHostComponent;
    const options: ISecondFormatOptions = {
        redraw$: new BehaviorSubject<void>(void 0),
    };

    beforeEach(waitForAsync(() => {
        Settings.defaultLocale = 'en';

        TestBed.configureTestingModule({
            imports: [
                UiSecondFormatModule,
            ],
            declarations: [
                TestHostComponent,
            ],
            providers: [
                {
                    provide: UI_SECONDFORMAT_OPTIONS,
                    useValue: options,
                },
                {
                    provide: USE_LUXON,
                    useValue: true,
                },
            ],
        });

        fixture = TestBed.createComponent(TestHostComponent);
        component = fixture.componentInstance;
    }));

    afterEach(() => {
        fixture.destroy();
        Settings.defaultLocale = 'en';
    });

    it('should create', () => {
        expect(component.uiSecondFormat).toBeDefined();
    });

    it('should remain empty for null values', () => {
        fixture.detectChanges();

        const text = fixture.debugElement.query(By.directive(UiSecondFormatDirective));

        expect(text.nativeElement.innerText).toBe('');
    });

    describe('language: english', () => {
        it('should return correctly display 2 days / PT51H1M3S', async () => {
            const days = 2 * DAY;
            const hours = 3 * HOUR;
            const minutes = 1 * MINUTE;
            const seconds = 3;

            component.seconds = days + hours + minutes + seconds;

            fixture.detectChanges();

            const text = fixture.debugElement.query(By.directive(UiSecondFormatDirective));

            expect(text.nativeElement.innerText)
                .toBe('2 days');
            const tooltip = await firstValueFrom(component.uiSecondFormat.tooltip$);
            expect(tooltip).toBe('PT51H1M3S');
        });

        it('should return correctly a day / PT25H1M1S', async () => {
            const days = DAY;
            const hours = HOUR;
            const minutes = MINUTE;
            const seconds = 1;

            component.seconds = days + hours + minutes + seconds;

            fixture.detectChanges();

            const text = fixture.debugElement.query(By.directive(UiSecondFormatDirective));

            expect(text.nativeElement.innerText)
                .toBe('1 day');
            const tooltip = await firstValueFrom(component.uiSecondFormat.tooltip$);
            expect(tooltip).toBe('PT25H1M1S');
        });

        it('should display 0 seconds / PT0S if the total amount of seconds is 0', async () => {
            component.seconds = 0;

            fixture.detectChanges();

            const text = fixture.debugElement.query(By.directive(UiSecondFormatDirective));

            expect(text.nativeElement.innerText)
                .toBe('0 seconds');
            const tooltip = await firstValueFrom(component.uiSecondFormat.tooltip$);
            expect(tooltip).toBe('PT0S');
        });
    });

    describe('changing languages', () => {
        it('should render the ja version after changing', async () => {
            Settings.defaultLocale = 'en';

            component.seconds = 40;
            fixture.detectChanges();

            const text = fixture.debugElement.query(By.directive(UiSecondFormatDirective));
            expect(text.nativeElement.innerText).toBe('40 seconds');
            const enTooltip = await firstValueFrom(component.uiSecondFormat.tooltip$);

            Settings.defaultLocale = 'ja';
            (options.redraw$ as BehaviorSubject<void>).next();

            fixture.detectChanges();
            expect(text.nativeElement.innerText).toBe('40 秒');
            const jaTooltip = await firstValueFrom(component.uiSecondFormat.tooltip$);
            expect(enTooltip).toBe(jaTooltip);
        });
    });
});

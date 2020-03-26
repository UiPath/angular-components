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
import { take } from 'rxjs/operators';

import {
    ISecondFormatOptions,
    UI_SECONDFORMAT_OPTIONS,
    UiSecondFormatDirective,
} from './ui-secondformat.directive';
import { UiSecondFormatModule } from './ui-secondformat.module';

@Component({
    selector: `ui-host-component`,
    template: `<ui-secondformat [seconds]="seconds"></ui-secondformat>`,
})
class TestHostComponent {
    public seconds?: number;

    @ViewChild(UiSecondFormatDirective, {
        static: true,
    })
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
            const tooltip = await component.uiSecondFormat.tooltip$.pipe(take(1)).toPromise();
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
                .toBe('a day');
            const tooltip = await component.uiSecondFormat.tooltip$.pipe(take(1)).toPromise();
            expect(tooltip).toBe('PT25H1M1S');
        });

        it('should display a few seconds / P0D if the total amount of seconds is 0', async () => {
            component.seconds = 0;

            fixture.detectChanges();

            const text = fixture.debugElement.query(By.directive(UiSecondFormatDirective));

            expect(text.nativeElement.innerText)
                .toBe('a few seconds');
            const tooltip = await component.uiSecondFormat.tooltip$.pipe(take(1)).toPromise();
            expect(tooltip).toBe('P0D');
        });
    });

    describe('changing languages', () => {
        it('should render the ja version after changing', async () => {
            moment.locale('en');

            component.seconds = 40;
            fixture.detectChanges();

            const text = fixture.debugElement.query(By.directive(UiSecondFormatDirective));
            expect(text.nativeElement.innerText).toBe('a few seconds');
            const enTooltip = await component.uiSecondFormat.tooltip$.pipe(take(1)).toPromise();

            moment.locale('ja');
            (options.redraw$ as BehaviorSubject<void>).next();

            fixture.detectChanges();
            expect(text.nativeElement.innerText).toBe('数秒');
            const jaTooltip = await component.uiSecondFormat.tooltip$.pipe(take(1)).toPromise();
            expect(enTooltip).toBe(jaTooltip);
        });
    });
});

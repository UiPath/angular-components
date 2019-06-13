import {
    Component,
    ViewChild,
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
    EventGenerator,
    Key,
} from '@uipath/angular/testing';

import * as faker from 'faker';
import {
    finalize,
    take,
} from 'rxjs/operators';

import { UiGridSearchComponent } from './ui-grid-search.component';
import { UiGridSearchModule } from './ui-grid-search.module';

@Component({
    template: `
    <ui-grid-search [debounce]="debounce"
                    [placeholder]="placeholder"
                    [maxLength]="maxLength"
                    [searchTooltip]="searchTooltip"
                    [clearTooltip]="clearTooltip"
                    [tooltipDisabled]="tooltipDisabled"
                    [value]="value">
    </ui-grid-search>
    `,
})
class TestFixtureComponent {
    @ViewChild(UiGridSearchComponent, {
        static: true,
    })
    public search!: UiGridSearchComponent;

    public debounce?: number;
    public placeholder?: string;
    public maxLength?: number;
    public searchTooltip?: string;
    public clearTooltip?: string;
    public tooltipDisabled?: string;
    public value?: string;
}

describe('Component: UiGrid', () => {
    describe('Component: UiGridSearch', () => {
        let fixture: ComponentFixture<TestFixtureComponent>;
        let component: TestFixtureComponent;
        let search: UiGridSearchComponent;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [
                    UiGridSearchModule,
                    NoopAnimationsModule,
                ],
                declarations: [
                    TestFixtureComponent,
                ],
            });

            fixture = TestBed.createComponent(TestFixtureComponent);

            fixture.detectChanges();

            component = fixture.componentInstance;
            search = component.search;
        });

        describe('State: initial', () => {
            it('should have all input properties undefined', () => {
                expect(search.debounce).toBeUndefined();
                expect(search.placeholder).toBeUndefined();
                expect(search.maxLength).toBeUndefined();
                expect(search.searchTooltip).toBeUndefined();
                expect(search.clearTooltip).toBeUndefined();
                expect(search.tooltipDisabled).toBeUndefined();
                expect(search.value).toBeUndefined();
            });
        });

        describe('Action: user input', () => {
            const value = faker.random.uuid();

            it(`should update the value after a user input`, () => {
                const input = fixture.debugElement.query(By.css('input'));

                input.nativeElement.value = value;
                input.nativeElement.dispatchEvent(EventGenerator.input());

                fixture.detectChanges();

                expect(search.value).toEqual(value);
            });

            it(`should emit the value after a user input occurs`, (done) => {
                search.searchChange
                    .pipe(
                        take(1),
                        finalize(done),
                    ).subscribe(searchValue => expect(searchValue).toEqual(value));

                const input = fixture.debugElement.query(By.css('input'));

                input.nativeElement.value = value;
                input.nativeElement.dispatchEvent(EventGenerator.input());

                fixture.detectChanges();
            });
        });

        describe('Action: clear', () => {
            const value = faker.random.uuid();

            it('should NOT be visible if the input holds no value', () => {
                const clear = fixture.debugElement.query(By.css('.ui-grid-search-cancel'));

                expect(clear.nativeElement.hasAttribute('hidden')).toEqual(true);
            });

            it('should be visible if the input has value', () => {
                const input = fixture.debugElement.query(By.css('input'));

                input.nativeElement.value = value;
                input.nativeElement.dispatchEvent(EventGenerator.input());

                fixture.detectChanges();

                const clear = fixture.debugElement.query(By.css('.ui-grid-search-cancel'));

                expect(clear.nativeElement.hasAttribute('hidden')).toEqual(false);
            });

            it('should clear value if the user clicks the clear button', () => {
                const input = fixture.debugElement.query(By.css('input'));

                input.nativeElement.value = value;
                input.nativeElement.dispatchEvent(EventGenerator.input());

                fixture.detectChanges();

                expect(search.value).not.toEqual('');

                const clear = fixture.debugElement.query(By.css('.ui-grid-search-cancel'));

                clear.nativeElement.dispatchEvent(EventGenerator.click);

                fixture.detectChanges();

                expect(search.value).toEqual('');
            });

            it('should clear value if the user presses the SPACE key on the clear button', () => {
                const input = fixture.debugElement.query(By.css('input'));

                input.nativeElement.value = value;
                input.nativeElement.dispatchEvent(EventGenerator.input());

                fixture.detectChanges();

                expect(search.value).not.toEqual('');

                const clear = fixture.debugElement.query(By.css('.ui-grid-search-cancel'));

                clear.nativeElement.dispatchEvent(EventGenerator.keyUp(Key.Space));

                fixture.detectChanges();

                expect(search.value).toEqual('');
            });

            it('should clear value if the user presses the ENTER key on the clear button', () => {
                const input = fixture.debugElement.query(By.css('input'));

                input.nativeElement.value = value;
                input.nativeElement.dispatchEvent(EventGenerator.input());

                fixture.detectChanges();

                expect(search.value).not.toEqual('');

                const clear = fixture.debugElement.query(By.css('.ui-grid-search-cancel'));

                clear.nativeElement.dispatchEvent(EventGenerator.keyUp(Key.Enter));

                fixture.detectChanges();

                expect(search.value).toEqual('');
            });
        });
    });
});

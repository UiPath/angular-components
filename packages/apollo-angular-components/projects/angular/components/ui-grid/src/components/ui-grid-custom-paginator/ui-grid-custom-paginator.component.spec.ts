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
import { EventGenerator } from '@uipath/angular/testing';

import {
    UiGridCustomPaginatorComponent,
    UiMatPaginatorIntl,
} from './ui-grid-custom-paginator.component';
import { UiGridCustomPaginatorModule } from './ui-grid-custom-paginator.module';

@Component({
    template: `
    <ui-grid-custom-paginator [pageIndex]="pageIndex"
                              [pageSize]="pageSize"
                              [length]="length"
                              [showFirstLastButtons]="true"
                              [selectablePageIndex]="selectablePageIndex">
    </ui-grid-custom-paginator>
    `,
})
class TestFixtureComponent {
    @ViewChild(UiGridCustomPaginatorComponent, {
        static: false,
    })
    paginator!: UiGridCustomPaginatorComponent;
    pageIndex = 0;
    pageSize = 10;
    length = 120;
    selectablePageIndex = false;
}

describe('Component: UiGrid', () => {
    describe('Component: UiGridCustomPaginator', () => {
        let fixture: ComponentFixture<TestFixtureComponent>;
        let component: TestFixtureComponent;
        let intl: UiMatPaginatorIntl;

        const setup = (selectablePageIndex = false, length = 120) => {
            TestBed.configureTestingModule({
                imports: [
                    UiGridCustomPaginatorModule,
                    NoopAnimationsModule,
                ],
                providers: [
                    UiMatPaginatorIntl,
                ],
                declarations: [
                    TestFixtureComponent,
                ],
            });

            intl = TestBed.inject(UiMatPaginatorIntl);
            fixture = TestBed.createComponent(TestFixtureComponent);
            component = fixture.componentInstance;

            component.selectablePageIndex = selectablePageIndex;
            component.length = length;

            fixture.detectChanges();
        };

        afterEach(() => {
            fixture.destroy();
        });

        it('should display correct page label', () => {
            setup();
            const label = fixture.debugElement.query(By.css('.mat-mdc-paginator-page-label'));
            expect(label.nativeElement.innerText).toEqual(intl.getPageLabel(1, 12));
        });

        it('should update page label on page change', () => {
            setup();
            const nextButton = fixture.debugElement.query(By.css('.mat-mdc-paginator-navigation-next'));
            const label = fixture.debugElement.query(By.css('.mat-mdc-paginator-page-label'));

            component.pageIndex = 0;
            nextButton.nativeElement.dispatchEvent(EventGenerator.click);

            fixture.detectChanges();

            expect(label.nativeElement.innerText).toEqual(intl.getPageLabel(2, 12));
        });

        it('should be able to change page index if selectablePageIndex is true and length is greater than pageSize', async () => {
            setup(true);
            const SELECTED_PAGE = 2;

            const pageIndexInputDebugEl = fixture.debugElement.query(By.css('[data-cy="page-index-select"]'));
            const pageIndexInput: HTMLInputElement = pageIndexInputDebugEl.nativeElement;

            pageIndexInput.click();

            fixture.detectChanges();
            await fixture.whenStable();
            fixture.detectChanges();

            const secondOption: HTMLElement = fixture.debugElement.queryAll(By.css('.mat-mdc-option'))[SELECTED_PAGE].nativeElement;
            secondOption.click();

            fixture.detectChanges();
            await fixture.whenStable();
            fixture.detectChanges();

            const pageRangeLabel = fixture.debugElement.query(By.css('.mat-mdc-paginator-range-label'));

            expect(pageRangeLabel.nativeElement.innerText).toEqual(
                component.paginator._intl.getRangeLabel(SELECTED_PAGE, component.pageSize, component.length),
            );
         });

        it('should not display page index select if selectablePageIndex is true and length is less than pageSize', () => {
            setup(true, 9);
            const pageIndexInput = fixture.debugElement.query(By.css('[data-cy="page-index-select"]'));

            expect(pageIndexInput).toBeNull();
        });

        it('should not display page index select if selectablePageIndex is false', () => {
            setup();
            const pageIndexInput = fixture.debugElement.query(By.css('[data-cy="page-index-select"]'));

            expect(pageIndexInput).toBeNull();
        });
    });

    describe('Service: UiMatPaginatorIntl', () => {
        let intl: UiMatPaginatorIntl;

        beforeEach(() => {
            TestBed.configureTestingModule({
                providers: [
                    UiMatPaginatorIntl,
                ],
            });

            intl = TestBed.inject(UiMatPaginatorIntl);
        });

        it('should return correct page label', () => {
            const labelString = intl.getPageLabel(1, 5);
            expect(labelString).toBe('Page 1 / 5');
        });

        it('should return correct string for undefined page count', () => {
            const labelString = intl.getPageLabel(3);
            expect(labelString).toBe('Page 3');
        });
    });
});

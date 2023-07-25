import {
    Component,
    ViewChild,
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
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
                              [showFirstLastButtons]="true">
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
}

describe('Component: UiGrid', () => {
    describe('Component: UiGridCustomPaginator', () => {
        let fixture: ComponentFixture<TestFixtureComponent>;
        let component: TestFixtureComponent;
        let intl: UiMatPaginatorIntl;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [
                    UiGridCustomPaginatorModule,
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

            fixture.detectChanges();

            component = fixture.componentInstance;
        });

        afterEach(() => {
            fixture.destroy();
        });

        it('should display correct page label', () => {
            const label = fixture.debugElement.query(By.css('.mat-mdc-paginator-page-label'));
            expect(label.nativeElement.innerText).toEqual(intl.getPageLabel(1, 12));
        });

        it('should update page label on page change', () => {
            const nextButton = fixture.debugElement.query(By.css('.mat-mdc-paginator-navigation-next'));
            const label = fixture.debugElement.query(By.css('.mat-mdc-paginator-page-label'));

            component.pageIndex = 0;
            nextButton.nativeElement.dispatchEvent(EventGenerator.click);

            fixture.detectChanges();

            expect(label.nativeElement.innerText).toEqual(intl.getPageLabel(2, 12));
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

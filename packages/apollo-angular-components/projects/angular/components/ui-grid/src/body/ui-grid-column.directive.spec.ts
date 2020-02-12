import {
    Component,
    ViewChild,
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
} from '@angular/core/testing';
import { UiGridModule } from '@uipath/angular/components/ui-grid';

import * as faker from 'faker';
import {
    finalize,
    take,
} from 'rxjs/operators';

import { UiGridColumnDirective } from './ui-grid-column.directive';

@Component({
    template: `
    <ui-grid-column [visible]="visible"
                    [width]="width"
                    [sortable]="sortable"
                    [searchable]="searchable"
                    [resizeable]="resizeable"
                    [title]="title"
                    [property]="property"
                    [method]="method"
                    [sort]="sort"
                    [refetch]="refetch"
                    [primary]="primary"
                    [minWidth]="minWidth">
    </ui-grid-column>
    `,
})
class TestFixtureComponent {
    @ViewChild(UiGridColumnDirective, {
        static: true,
    })
    public column!: UiGridColumnDirective<any>;

    public visible = false;
    public width?: string;
    public sortable?: boolean;
    public searchable?: boolean;
    public resizeable?: boolean;
    public title?: string;
    public property?: string;
    public method?: string;
    public sort?: 'asc' | 'desc' | '';
    public refetch?: boolean;
    public primary?: boolean;
    public minWidth?: number;
}

type TestInputProperty = keyof TestFixtureComponent & keyof UiGridColumnDirective<any>;

const BOOLEAN_LIST = [true, false];
const BOOLEAN_PROPERTIES: TestInputProperty[] = [
    'visible',
    'sortable',
    'resizeable',
    'searchable',
    'primary',
    'refetch',
];

describe('Component: UiGridColumn', () => {
    describe('Directive: UiGridColumn', () => {
        let fixture: ComponentFixture<TestFixtureComponent>;
        let component: TestFixtureComponent;
        let column: UiGridColumnDirective<any>;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [UiGridModule],
                declarations: [TestFixtureComponent],
            });

            fixture = TestBed.createComponent(TestFixtureComponent);

            fixture.detectChanges();

            component = fixture.componentInstance;
            column = component.column;
        });

        describe('State: initial', () => {
            it('should create an instance of the directive', () => {
                expect(column).toBeDefined();
            });
            it('should have visible set to false', () => {
                expect(column.visible).toBeFalse();
            });

            it('should have all properties undefined', () => {
                expect(column.width).toBeNaN();
                expect(column.sortable).toBeUndefined();
                expect(column.searchable).toBeUndefined();
                expect(column.resizeable).toBeUndefined();
                expect(column.refetch).toBeUndefined();
                expect(column.title).toBeUndefined();
                expect(column.property).toBeUndefined();
                expect(column.method).toBeUndefined();
                expect(column.sort).toBeUndefined();
                expect(column.primary).toBeUndefined();
                expect(column.minWidth).toBeUndefined();
            });
        });

        describe('State: configured inputs', () => {
            BOOLEAN_PROPERTIES.forEach(boolProperty => {
                BOOLEAN_LIST.forEach(value => {
                    it(`should set ${boolProperty} to '${value}'`, () => {
                        expect(column[boolProperty]).toEqual(component[boolProperty]);

                        (component as any)[boolProperty] = value;

                        fixture.detectChanges();

                        expect(column[boolProperty]).toEqual(value);
                    });
                });
            });

            const width = 350;
            const widthPercentage = `${width / 10}%`;
            it(`should have a width of ${width} if set to '${widthPercentage}'`, () => {
                component.width = widthPercentage;

                fixture.detectChanges();

                expect(column.width).toEqual(width);
            });

            const minWidth = 45;
            it(`should have a minimum width of ${minWidth} if set to '${minWidth}'`, () => {
                component.minWidth = minWidth;

                fixture.detectChanges();

                expect(column.minWidth).toEqual(minWidth);
            });

            const property = faker.database.column();
            it(`should be linked to property`, () => {
                expect(column.property).toBeUndefined();

                component.property = property;

                fixture.detectChanges();

                expect(column.property).toEqual(property);
            });

            it('should reject invalid width inputs', () => {
                component.width = '30%';

                fixture.detectChanges();

                component.width = 'XXX111%';

                fixture.detectChanges();

                expect(column.width).toEqual(300);
            });

            it(`should have aria sort 'ascending' for 'asc' columns`, () => {
                component.sort = 'asc';

                fixture.detectChanges();

                expect(column.ariaSort).toEqual('ascending');
            });

            it(`should have aria sort 'descending' for 'desc' columns`, () => {
                component.sort = 'desc';

                fixture.detectChanges();

                expect(column.ariaSort).toEqual('descending');
            });

            it(`should have aria sort 'none' for standard columns`, () => {
                component.sort = '';

                fixture.detectChanges();

                expect(column.ariaSort).toEqual('none');
            });
        });

        describe('Event: state change', () => {
            it(`should emit change if property 'visible' changes`, (done) => {
                column.change$
                    .pipe(
                        take(1),
                        finalize(done),
                    ).subscribe(changes => {
                        expect(changes.visible).toBeDefined();
                        expect(changes.visible.previousValue).not.toBe(changes.visible.currentValue);
                        expect(changes.visible.isFirstChange()).toEqual(false);
                    });

                component.visible = !component.visible;

                fixture.detectChanges();
            });

            it(`should emit change if property 'sort' changes`, (done) => {
                column.change$
                    .pipe(
                        take(1),
                        finalize(done),
                    ).subscribe(changes => {
                        expect(changes.sort).toBeDefined();
                        expect(changes.sort.previousValue).not.toBe(changes.sort.currentValue);
                        expect(changes.sort.isFirstChange()).toEqual(false);
                    });

                component.sort = 'desc';

                fixture.detectChanges();
            });
        });
    });
});

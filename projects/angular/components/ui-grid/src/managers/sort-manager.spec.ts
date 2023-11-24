import * as faker from 'faker';
import { BehaviorSubject } from 'rxjs';
import {
    finalize,
    skip,
    take,
} from 'rxjs/operators';

import { TestBed } from '@angular/core/testing';

import { UiGridColumnDirective } from '../body/ui-grid-column.directive';
import {
    ResizeStrategy,
    SortManager,
    UI_GRID_RESIZE_STRATEGY_STREAM,
} from '../managers';
import {
    generateColumn,
    generateListFactory,
    ITestEntity,
} from '../test';

describe('Component: UiGrid', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{
                provide: UI_GRID_RESIZE_STRATEGY_STREAM,
                useFactory: () => new BehaviorSubject(ResizeStrategy.ImmediateNeighbourHalt),
            }],
        });
    });

    const generateColumnList = generateListFactory(generateColumn, TestBed.runInInjectionContext);

    describe('Manager: SortManager', () => {
        let manager: SortManager<ITestEntity>;

        beforeEach(() => {
            manager = new SortManager<ITestEntity>();
        });

        describe('State: initial', () => {
            it('should have column length 0', () => {
                expect(manager.columns.length).toEqual(0);
            });

            it('should expose a sort stream of type behavior subject', () => {
                expect(manager.sort$.constructor).toBe(BehaviorSubject);
            });

            it('should expose a sort stream with initial value an empty object', () => {
                expect(Object.keys(manager.sort$.getValue()).length).toBe(0);
            });
        });

        describe('State: columns configured', () => {
            let columns: UiGridColumnDirective<ITestEntity>[];

            beforeEach(() => {
                columns = generateColumnList('random');
                columns.forEach(column => column.sortable = true);
                manager.columns = columns;
            });

            it('should update the collection', () => {
                expect(manager.columns.length).toEqual(columns.length);
                expect(manager.columns).toBe(columns);
            });

            it('should update sort event if columns change', () => {
                const cols = generateColumnList('random');
                cols.forEach(column => {
                    column.sortable = true;
                    column.sort = 'asc';
                });

                manager.columns = cols;
                expect(Object.keys(manager.sort$.getValue()).length).toBe(4);
                expect(manager.sort$.getValue().userEvent).toBeFalsy();
            });

            describe('Event: user sort change', () => {
                it(`should cycle column sort from '' to 'asc'`, () => {
                    const column = faker.helpers.randomize(columns);
                    column.sort = '';

                    manager.changeSort(column);

                    expect(column.sort).toEqual('asc');
                });

                it(`should cycle column sort from 'asc' to 'desc'`, () => {
                    const column = faker.helpers.randomize(columns);
                    column.sort = 'asc';

                    manager.changeSort(column);

                    expect(column.sort).toEqual('desc');
                });

                it(`should cycle column sort from 'desc' to ''`, () => {
                    const column = faker.helpers.randomize(columns);
                    column.sort = 'desc';

                    manager.changeSort(column);

                    expect(column.sort).toEqual('');
                });

                it(`should revert other column sort states to ''`, () => {
                    const [first, ...rest] = columns;
                    const targetColumn = faker.helpers.randomize(rest);

                    first.sort = 'desc';
                    targetColumn.sort = '';

                    manager.changeSort(targetColumn);

                    expect(first.sort).toEqual('');
                    expect(targetColumn.sort).toEqual('asc');

                    columns.filter(column => column !== targetColumn)
                        .forEach(column => {
                            expect(column.sort).toEqual('');
                        });
                });

                it('should emit a sort change event', (done) => {
                    const column = faker.helpers.randomize(columns);
                    column.sort = 'asc';

                    manager.sort$
                        .pipe(
                            skip(1),
                            take(1),
                            finalize(done),
                        ).subscribe(sort => {
                            expect(sort.field).toEqual(column.property!);
                            expect(sort.direction).toEqual(column.sort);
                            expect(sort.userEvent).toBeTruthy();
                        });

                    manager.changeSort(column);
                });

                it('should emit only ONE sort event for each sort change', (done) => {
                    const [first, ...rest] = columns;
                    const second = faker.helpers.randomize(rest);

                    first.sort = 'asc';
                    second.sort = 'desc';

                    manager.sort$
                        .pipe(
                            skip(1),
                            take(1),
                        ).subscribe(sort => {
                            expect(sort.field).toEqual(first.property!);
                            expect(sort.direction).toEqual(first.sort);
                            expect(sort.userEvent).toBeTruthy();
                        });

                    manager.sort$
                        .pipe(
                            skip(2),
                            take(1),
                            finalize(done),
                        ).subscribe(sort => {
                            expect(sort.field).toEqual(second.property!);
                            expect(sort.direction).toEqual(second.sort);
                            expect(sort.userEvent).toBeTruthy();
                        });

                    manager.changeSort(first);
                    manager.changeSort(second);
                });
            });
        });

        describe('State: doubled one column', () => {
            let columns: UiGridColumnDirective<ITestEntity>[];

            beforeEach(() => {
                columns = generateColumnList('random');
                columns.forEach(column => column.sortable = true);

            });

            it('should emit the reference property', (done) => {
                const [firstColumn, duplicateColumn] = columns;
                firstColumn.property = 'prop1';
                duplicateColumn.property = 'prop2';
                duplicateColumn.queryProperty = 'prop1';
                duplicateColumn.sort = 'desc';
                manager.columns = columns;

                manager.sort$
                    .pipe(
                        skip(1),
                        take(1),
                        finalize(done),
                    ).subscribe(sort => {
                        expect(sort.field).toEqual(duplicateColumn.queryProperty!);
                        expect(sort.direction).toEqual(duplicateColumn.sort);
                        expect(sort.userEvent).toBeTruthy();
                    });

                manager.changeSort(duplicateColumn);
            });
        });

    });
});

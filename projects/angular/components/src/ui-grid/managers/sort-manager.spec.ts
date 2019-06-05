import * as faker from 'faker';
import { BehaviorSubject } from 'rxjs';
import {
    finalize,
    skip,
    take,
} from 'rxjs/operators';

import { UiGridColumnDirective } from '../body/ui-grid-column.directive';
import { SortManager } from '../managers';
import {
    generateColumn,
    generateListFactory,
    ITestEntity,
} from '../test';

describe('Component: UiGrid', () => {
    const generateColumnList = generateListFactory(generateColumn);

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

            describe('Event: sort change', () => {
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
                        });

                    manager.sort$
                        .pipe(
                            skip(2),
                            take(1),
                            finalize(done),
                        ).subscribe(sort => {
                            expect(sort.field).toEqual(second.property!);
                            expect(sort.direction).toEqual(second.sort);
                        });

                    manager.changeSort(first);
                    manager.changeSort(second);
                });
            });
        });
    });
});

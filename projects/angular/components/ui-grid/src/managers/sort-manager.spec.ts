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

            it('should expose a sort stream for multiple columns of type behavior subject', () => {
                expect(manager.multiSort$.constructor).toBe(BehaviorSubject);
            });

            it('should expose a sort stream with initial value an empty object', () => {
                expect(Object.keys(manager.sort$.getValue()).length).toBe(0);
            });

            it('should expose a sort stream for multiple columns with initial value an empty array', () => {
                expect(Object.keys(manager.multiSort$.getValue()).length).toBe(0);
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

                it('should emit multi sort change event', (done) => {
                    const [first, ...rest] = columns;
                    const second = faker.helpers.randomize(rest);


                    manager.multiSort$
                        .pipe(
                            skip(2),
                            take(1),
                            finalize(done),
                        ).subscribe(sort => {
                            expect(sort[0].field).toEqual(second.property!);
                            expect(sort[0].direction).toEqual('desc');
                            expect(sort[1].field).toEqual(first.property!);
                            expect(sort[1].direction).toEqual('asc');
                        });
                    first.sort = '';
                    manager.changeSort(first);
                    second.sort = 'asc';
                    manager.changeSort(second);
                });

                it('should emit multi sort change event for each column only once', (done) => {
                    const [first, ...rest] = columns;
                    const second = faker.helpers.randomize(rest);

                    manager.multiSort$
                        .pipe(
                            skip(3),
                            take(1),
                            finalize(done),
                        ).subscribe(sort => {
                            expect(sort.filter(c => c.title === first.title).length).toEqual(1);
                            expect(sort[0].field).toEqual(first.property!);
                            expect(sort[0].direction).toEqual('desc');
                            expect(sort[1].field).toEqual(second.property!);
                            expect(sort[1].direction).toEqual('desc');
                        });

                    first.sort = '';
                    manager.changeSort(first);
                    second.sort = 'asc';
                    manager.changeSort(second);
                    first.sort = 'asc';
                    manager.changeSort(first);
                });

                it('should emit multi sort change event with only 1 element in the array in case of sort reset', (done) => {
                    const [first, ...rest] = columns;
                    const second = faker.helpers.randomize(rest);

                    manager.multiSort$
                        .pipe(
                            skip(3),
                            take(1),
                            finalize(done),
                        ).subscribe(sort => {
                            expect(sort.length).toEqual(1);
                            expect(sort[0].field).toEqual(first.property!);
                            expect(sort[0].direction).toEqual('');
                        });

                    first.sort = '';
                    manager.changeSort(first);
                    second.sort = 'asc';
                    manager.changeSort(second);
                    first.sort = 'desc';
                    manager.changeSort(first);
                });
            });

            describe('Event: group change', () => {
                it('should emit multi sort change event with only first element as the column by which it is grouped', (done) => {
                    const column = faker.helpers.randomize(columns);
                    column.sort = 'asc';

                    manager.multiSort$
                        .pipe(
                            skip(1),
                            take(1),
                            finalize(done),
                        ).subscribe(sort => {
                            expect(sort.length).toEqual(1);
                            expect(sort[0].field).toEqual(column.property!);
                            expect(sort[0].direction).toEqual('asc');
                        });

                    manager.changeGroup(column);
                });

                it('should emit multi sort change event where sorted column as the second element in the multiSort array', (done) => {
                    const [first, second, ...rest] = columns;
                    const third = faker.helpers.randomize(rest);

                    manager.multiSort$
                        .pipe(
                            skip(3),
                            take(1),
                            finalize(done),
                        ).subscribe(sort => {
                            expect(sort[0].field).toEqual(second.property!);
                            expect(sort[0].direction).toEqual('asc');
                            expect(sort[1].field).toEqual(third.property!);
                            expect(sort[1].direction).toEqual('desc');
                            expect(sort[2].field).toEqual(first.property!);
                            expect(sort[2].direction).toEqual('asc');
                        });

                    first.sort = '';
                    manager.changeSort(first);
                    second.sort = 'asc';
                    manager.changeGroup(second);
                    third.sort = 'asc';
                    manager.changeSort(third);
                });

                it('should emit multi sort change event with no groupBy when grouping is done by none', (done) => {
                    const [first, ...rest] = columns;
                    const second = faker.helpers.randomize(rest);

                    manager.multiSort$
                        .pipe(
                            skip(3),
                            take(1),
                            finalize(done),
                        ).subscribe(sort => {
                            expect(sort.length).toEqual(1);
                            expect(sort[0].field).toEqual(first.property!);
                            expect(sort[0].direction).toEqual('asc');
                        });

                    first.sort = '';
                    manager.changeSort(first);
                    manager.changeGroup(second);
                    manager.changeGroup(null);
                });

                it('should emit multi sort change event with each column only once', (done) => {
                    const [first, ...rest] = columns;
                    const second = faker.helpers.randomize(rest);

                    manager.multiSort$
                        .pipe(
                            skip(3),
                            take(1),
                            finalize(done),
                        ).subscribe(sort => {
                            expect(sort.length).toEqual(2);
                            expect(sort[0].field).toEqual(first.property!);
                            expect(sort[0].direction).toEqual('asc');
                            expect(sort[1].field).toEqual(second.property!);
                            expect(sort[1].direction).toEqual('desc');
                        });

                    first.sort = '';
                    manager.changeSort(first);
                    second.sort = 'asc';
                    manager.changeSort(second);
                    manager.changeGroup(first);
                });

                it('should emit multi sort change with group by column never in unsorted state', (done) => {
                    const first = faker.helpers.randomize(columns);

                    manager.multiSort$
                        .pipe(
                            skip(2),
                            take(1),
                            finalize(done),
                        ).subscribe(sort => {
                            expect(sort.length).toEqual(1);
                            expect(sort[0].field).toEqual(first.property!);
                            expect(sort[0].direction).toEqual('desc');
                        });

                    manager.multiSort$
                        .pipe(
                            skip(3),
                            take(1),
                            finalize(done),
                        ).subscribe(sort => {
                            expect(sort.length).toEqual(1);
                            expect(sort[0].field).toEqual(first.property!);
                            expect(sort[0].direction).toEqual('asc');
                        });

                    manager.changeGroup(first);
                    manager.changeSort(first);
                    manager.changeSort(first);
                });
            });
        });
    });
});

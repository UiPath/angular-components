import cloneDeep from 'lodash-es/cloneDeep';
import isArray from 'lodash-es/isArray';
import { BehaviorSubject } from 'rxjs';
import { skip } from 'rxjs/operators';

import {
    generateEntity,
    generateListFactory,
    ITestEntity,
} from '../test';
import { DataManager } from './data-manager';

describe('Component: UiGrid', () => {
    const generateEntityList = generateListFactory(generateEntity);

    describe('Defaults', () => {
        it('should have correct defaults', () => {
            const mgr = new DataManager<ITestEntity>();
            expect(mgr.useCache).toBe(false);
            expect(mgr.idProperty).toBe('id');
        });
    });

    [
        {
            useCache: true,
            idProperty: 'id' as const,
        },
        {
            useCache: false,
            idProperty: 'id' as const,
        },
    ].forEach((config) => {
        describe(`Manager: DataManager, useCache: ${config.useCache}, idProperty: ${config.idProperty}`, () => {
            let manager: DataManager<ITestEntity>;

            beforeEach(() => {
                manager = new DataManager<ITestEntity>(config);
            });

            describe('State: initial', () => {
                it('should have a length of 0', () => {
                    expect(manager.length).toEqual(0);
                });

                it('should be pristine', () => {
                    expect(manager.pristine).toEqual(true);
                });

                it('should expose a behavior subject data stream', () => {
                    expect(manager.data$).toBeDefined();
                    expect(manager.data$.constructor).toBe(BehaviorSubject);
                });

                it('should expose a data stream with initial value an empty array', () => {
                    const initialValue = manager.data$.getValue();
                    expect(isArray(initialValue)).toBe(true);
                    expect(initialValue.length).toBe(0);
                });
            });

            describe('State: with data', () => {
                let data: ITestEntity[];

                beforeEach(() => {
                    data = generateEntityList('random');
                    manager.update(data);
                });

                it('should NOT be pristine', () => {
                    expect(manager.pristine).toEqual(false);
                });

                describe('Method: update', () => {
                    it(`should NOT preserve list or item reference`, () => {
                        const managerList = manager.data$.getValue();

                        expect(managerList).not.toBe(data);

                        manager.forEach((managerEntry, idx) => {
                            const entry = data[idx];
                            expect(managerEntry).not.toBe(entry);
                            expect(managerEntry!.myObj).not.toBe(entry.myObj);
                        });
                    });

                    it(`should have length equal to the new data list`, () => {
                        expect(manager.length).toEqual(data.length);
                    });

                    it('should have the same entry on the same indexes', () => {
                        const managerList = manager.data$.getValue();

                        expect(managerList).toEqual(data);

                        data.forEach((entry, idx) => {
                            const managerEntry = manager.get(idx);
                            expect(managerEntry).toEqual(entry);
                        });
                    });

                    it('should update the internal array reference on subsequent updates', () => {
                        const firstEntity = manager.get(0);
                        const firstEntityClone = cloneDeep(firstEntity);

                        const update = generateEntityList(manager.length);

                        manager.update(update);

                        const firstEntityUpdated = manager.get(0);

                        expect(firstEntityClone).not.toEqual(firstEntityUpdated);

                        if (manager.useCache) {
                            expect(firstEntity).toBe(firstEntityUpdated);
                        } else {
                            expect(update[0]).toEqual(firstEntityUpdated);
                        }
                    });

                    it('should emit new data when on update', (done) => {
                        const update = generateEntityList(3);

                        manager.data$
                            .pipe(skip(1))
                            .subscribe((event) => {
                                expect(event).not.toBe(update);
                                expect(event).toEqual(update);

                                done();
                            });

                        manager.update(update);
                    });
                });

                describe('Method: patchRow', () => {
                    it('should update specified properties', () => {
                        const first = manager.get(0);

                        const patch: Partial<ITestEntity> = {
                            myBool: false,
                            myDate: new Date(),
                        };

                        manager.patchRow(first.id, patch);

                        expect(first.myBool).toEqual(patch.myBool!);
                        expect(first.myDate).toEqual(patch.myDate!);
                    });

                    it('should emit new data when an entry is patched', (done) => {
                        const middle = manager.get(Math.floor(manager.length / 2));

                        const patch: Partial<ITestEntity> = {
                            myBool: false,
                            myDate: new Date(),
                        };

                        manager.data$
                            .pipe(skip(1))
                            .subscribe(event => {
                                const emittedEntry = event.find(x => x.id === middle.id);

                                expect(middle.myBool).toEqual(patch.myBool!);
                                expect(middle.myDate).toEqual(patch.myDate!);
                                if (manager.useCache) {
                                    expect(emittedEntry).toBe(middle);
                                }
                                expect(emittedEntry).toEqual(middle);

                                done();
                            });

                        manager.patchRow(middle.id, patch);
                    });

                    it('should update NESTED properties', () => {
                        const first = manager.get(0);

                        const patch = {
                            myObj: {
                                myObjNumber: -123,
                                myObjString: 'XYZ',
                            },
                        } as Partial<ITestEntity>;

                        manager.patchRow(first.id, patch);

                        expect(first.myObj.myObjNumber).toEqual(patch.myObj!.myObjNumber);
                        expect(first.myObj.myObjString).toEqual(patch.myObj!.myObjString);
                    });

                    it('should update the hashed value for the affected entry', () => {
                        if (!manager.useCache) {
                            return;
                        }

                        const first = manager.get(0);
                        const initialHash = manager.hashTrack(null, first);

                        const patch: Partial<ITestEntity> = {
                            myBool: false,
                            myDate: new Date(),
                        };

                        manager.patchRow(first.id, patch);
                        expect(manager.hashTrack(null, first)).not.toBe(initialHash);
                    });
                });

                describe('Method: find', () => {
                    it('should be able fetch the FIRST entry by id', () => {
                        const [first] = manager.data$.getValue();

                        const found = manager.find(first.id);

                        expect(found).toEqual(first);
                        expect(found).toBe(first);
                    });

                    it('should be able fetch the LAST entry by id', () => {
                        const [last] = manager.data$.getValue().slice().reverse();

                        const found = manager.find(last.id);

                        expect(found).toEqual(last);
                        expect(found).toBe(last);
                    });
                });

                describe('Method: get', () => {
                    it('should be able fetch the FIRST entry by index', () => {
                        const [first] = manager.data$.getValue();

                        const found = manager.get(0);

                        expect(found).toEqual(first);
                        expect(found).toBe(first);
                    });

                    it('should be able fetch the LAST entry by index', () => {
                        const [last] = manager.data$.getValue().slice().reverse();

                        const found = manager.get(manager.length - 1);

                        expect(found).toEqual(last);
                        expect(found).toBe(last);
                    });
                });

                describe('Method: forEach', () => {
                    it('should itterate through all entries', () => {
                        const managerList = manager.data$.getValue();

                        let itterated = 0;

                        manager.forEach((entry, idx) => {
                            expect(entry).toEqual(managerList[idx]);
                            itterated++;
                        });

                        expect(itterated).toEqual(manager.length);
                    });
                });

                describe('Method: every', () => {
                    it('should yield the same result as if applied to the array directly', () => {
                        const managerList = manager.data$.getValue();

                        const listResult = managerList.every(e => e!.myBool);
                        const managerResult = manager.every(e => e!.myBool);

                        expect(listResult).toEqual(managerResult);
                    });
                });

                describe('Method: some', () => {
                    it('should yield the same result as if applied to the array directly', () => {
                        const managerList = manager.data$.getValue();

                        const listResult = managerList.some(e => e!.myBool);
                        const managerResult = manager.some(e => e!.myBool);

                        expect(listResult).toEqual(managerResult);
                    });
                });
            });
        });
    });
});

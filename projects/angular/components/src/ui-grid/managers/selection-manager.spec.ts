import { Subject } from 'rxjs';
import {
    finalize,
    skip,
    take,
} from 'rxjs/operators';

import { SelectionManager } from '../managers';
import {
    generateEntity,
    generateListFactory,
    ITestEntity,
} from '../test';

describe('Component: UiGrid', () => {
    describe('Manager: SelectionManager', () => {
        let manager: SelectionManager<ITestEntity>;

        beforeEach(() => {
            manager = new SelectionManager<ITestEntity>();
        });

        describe('State: initial', () => {
            it('should have selection length 0', () => {
                expect(manager.selected.length).toEqual(0);
            });

            it('should expose a change stream of type subject', () => {
                expect(manager.changed$.constructor).toBe(Subject);
            });

            it('should NOT have a value', () => {
                expect(manager.hasValue()).toEqual(false);
            });

            it('should be empty', () => {
                expect(manager.isEmpty()).toEqual(true);
            });

            it('should have `add` and `remove` empty when requesting the difference', () => {
                expect(manager.difference.add.length).toEqual(0);
                expect(manager.difference.remove.length).toEqual(0);
            });

            it('should have an empty snapshot', () => {
                expect(manager.selectionSnapshot.length).toEqual(0);
            });
        });

        it('should add an item if toggling an item that is NOT part of the selection', () => {
            const entity = generateEntity();

            manager.toggle(entity);

            expect(manager.selected).toEqual([entity]);
        });

        it('should remove an item if toggling an item that is part of the selection', () => {
            const entity = generateEntity();

            manager.toggle(entity);

            expect(manager.selected).toEqual([entity]);

            manager.toggle(entity);

            expect(manager.selected.length).toEqual(0);
        });

        it('should correctly compute the difference when adding / removing multiple items', () => {
            const seedEntityList = generateListFactory(generateEntity)('random');
            manager.select(...seedEntityList);

            manager.snapshot();

            const newSelectionList = generateListFactory(generateEntity)('random');
            const removedSelectionList = seedEntityList.filter((_, idx) => idx % 2);

            manager.deselect(...removedSelectionList);
            manager.select(...newSelectionList);

            const diff = manager.difference;

            expect(diff.add).toEqual(newSelectionList);
            expect(diff.remove).toEqual(removedSelectionList);
        });

        describe('State: one item selected', () => {
            const selectedEntity = generateEntity();

            beforeEach(() => {
                manager.select(selectedEntity);
            });

            it('should have a length of 1', () => {
                expect(manager.selected.length).toEqual(1);
            });

            it('should have a value', () => {
                expect(manager.hasValue()).toEqual(true);
            });

            it('should NOT be empty', () => {
                expect(manager.isEmpty()).toEqual(false);
            });

            it('should state the selected entry is selected', () => {
                expect(manager.isSelected(selectedEntity)).toEqual(true);
            });

            it('should state the selected entry is selected, if only the `id` is passed', () => {
                expect(manager.isSelected({ id: selectedEntity.id } as ITestEntity)).toEqual(true);
            });

            it('should state that a random entry is NOT selected', () => {
                expect(manager.isSelected(generateEntity())).toEqual(false);
            });

            it('should update difference if a snapshot is captured before selecting a second item', () => {
                manager.snapshot();
                const newEntry = generateEntity();

                manager.select(newEntry);

                expect(manager.difference.add).toEqual([newEntry]);
                expect(manager.difference.remove.length).toEqual(0);
            });

            it('should emit change if deselecting the current item', (done) => {
                manager.
                    changed$
                    .pipe(
                        take(1),
                        finalize(done),
                    ).subscribe(change => {
                        expect(change.added.length).toEqual(0);
                        expect(change.removed.length).toEqual(1);
                        expect(change.removed).toEqual([selectedEntity]);
                    });

                manager.deselect(selectedEntity);
            });
        });

        describe('State: multiple items selected', () => {
            const selectedEntityList = generateListFactory(generateEntity)('random');

            beforeEach(() => {
                manager.select(...selectedEntityList);
            });

            it('should have a length equal to the selected item list', () => {
                expect(manager.selected.length).toEqual(selectedEntityList.length);
            });

            it('should have a value', () => {
                expect(manager.hasValue()).toEqual(true);
            });

            it('should NOT be empty', () => {
                expect(manager.isEmpty()).toEqual(false);
            });

            it('should state the selected entry is selected', () => {
                selectedEntityList.forEach(selectedEntity => {
                    expect(manager.isSelected(selectedEntity)).toEqual(true);
                });
            });

            it('should state that a random entry is NOT selected', () => {
                expect(manager.isSelected(generateEntity())).toEqual(false);
            });

            it('should emit all selected and deselected values', (done) => {
                const deselectedEntityList = selectedEntityList.filter((_, idx) => idx % 2);
                const newEntityList = generateListFactory(generateEntity)('random');

                manager.
                    changed$
                    .pipe(
                        take(1),
                    ).subscribe(change => {
                        expect(change.added.length).toEqual(0);
                        expect(change.removed.length).toEqual(deselectedEntityList.length);
                        expect(change.removed).toEqual(deselectedEntityList);
                    });

                manager.
                    changed$
                    .pipe(
                        skip(1),
                        take(1),
                        finalize(done),
                    ).subscribe(change => {
                        expect(change.removed.length).toEqual(0);
                        expect(change.added.length).toEqual(newEntityList.length);
                        expect(change.added).toEqual(newEntityList);
                    });

                manager.deselect(...deselectedEntityList);
                manager.select(...newEntityList);
            });
        });
    });
});

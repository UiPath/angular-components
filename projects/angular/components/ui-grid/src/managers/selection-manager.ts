import cloneDeep from 'lodash-es/cloneDeep';
import differenceBy from 'lodash-es/differenceBy';
import {
    BehaviorSubject,
    Subject,
} from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

import {
    SelectionChange,
    SelectionModel,
} from '@angular/cdk/collections';

import {
    IGridDataEntry,
    ISelectionDiff,
} from '../models';

/**
 * @internal
 * @ignore
 */
export class SelectionManager<T extends IGridDataEntry> {
    get selected(): T[] {
        return Array.from(this._selection.values());
    }

    get selectionSnapshot(): T[] {
        return Array.from(this._selectionSnapshot.values());
    }

    get difference(): ISelectionDiff<T> {
        return {
            add: differenceBy(this.selected, this.selectionSnapshot, 'id'),
            remove: differenceBy(this.selectionSnapshot, this.selected, 'id'),
        };
    }

    changed$ = new Subject<SelectionChange<T>>();

    private _hasValue$ = new BehaviorSubject(false);

    // eslint-disable-next-line @typescript-eslint/member-ordering
    hasValue$ = this._hasValue$.pipe(distinctUntilChanged());

    private _selection = new Map<number | string, T>();

    private _selectionSnapshot = new Map<number | string, T>();

    private _deselectedToEmit: T[] = [];

    private _selectedToEmit: T[] = [];

    constructor(
        initiallySelectedValues?: T[],
        private _emitChanges = true,
    ) {

        if (initiallySelectedValues?.length) {
            initiallySelectedValues.forEach(value => this._markSelected(value));
            this._selectedToEmit.length = 0;
        }
    }

    select = (...values: T[]): void =>
        this._updateState(this._markSelected, values);

    deselect = (...values: T[]): void =>
        this._updateState(this._unmarkSelected, values);

    toggle(value: T): void {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        this.isSelected(value) ? this.deselect(value) : this.select(value);
    }

    clear(): void {
        this._selection.forEach(v => this._unmarkSelected(v));
        this._selection.clear();
        this._emitChangeEvent();
    }

    isSelected(value: T): boolean {
        return this._selection.has(value.id);
    }

    isEmpty(): boolean {
        return this._selection.size === 0;
    }

    hasValue(): boolean {
        return !this.isEmpty();
    }

    snapshot() {
        this._selectionSnapshot = cloneDeep(this._selection);
    }

    destroy() {
        this._selection.clear();
        this._selectionSnapshot.clear();
        this._hasValue$.next(false);
    }

    private _updateState = (predicate: (value: T) => void, values: T[]) => {
        values.forEach(predicate);
        this._emitChangeEvent();
    };

    private _emitChangeEvent() {
        this._hasValue$.next(this.hasValue());
        if (this._selectedToEmit.length || this._deselectedToEmit.length) {
            this.changed$.next({
                source: {} as SelectionModel<T>,
                added: this._selectedToEmit,
                removed: this._deselectedToEmit,
            } as SelectionChange<T>);

            this._deselectedToEmit = [];
            this._selectedToEmit = [];
        }
    }

    private _markSelected = (value: T) => {
        if (!this.isSelected(value)) {
            this._selection.set(value.id, cloneDeep(value));

            if (this._emitChanges) {
                this._selectedToEmit.push(value);
            }
        }
    };

    private _unmarkSelected = (value: T) => {
        if (this.isSelected(value)) {
            this._selection.delete(value.id);

            if (this._emitChanges) {
                this._deselectedToEmit.push(value);
            }
        }
    };
}

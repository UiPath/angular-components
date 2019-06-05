import {
    SelectionChange,
    SelectionModel,
} from '@angular/cdk/collections';

import cloneDeep from 'lodash-es/cloneDeep';
import differenceBy from 'lodash-es/differenceBy';
import { Subject } from 'rxjs';

import {
    IGridDataEntry,
    ISelectionDiff,
} from '../models';

/**
 * @internal
 * @ignore
 */
export class SelectionManager<T extends IGridDataEntry> {
    public get selected(): T[] {
        return Array.from(this._selection.values());
    }

    public get selectionSnapshot(): T[] {
        return Array.from(this._selectionSnapshot.values());
    }

    public get difference(): ISelectionDiff<T> {
        return {
            add: differenceBy(this.selected, this.selectionSnapshot, 'id'),
            remove: differenceBy(this.selectionSnapshot, this.selected, 'id'),
        };
    }

    public changed$: Subject<SelectionChange<T>> = new Subject();

    private _selection = new Map<number | string, T>();

    private _selectionSnapshot = new Map<number | string, T>();

    private _deselectedToEmit: T[] = [];

    private _selectedToEmit: T[] = [];

    constructor(
        initiallySelectedValues?: T[],
        private _emitChanges = true,
    ) {

        if (initiallySelectedValues && initiallySelectedValues.length) {
            initiallySelectedValues.forEach(value => this._markSelected(value));
            this._selectedToEmit.length = 0;
        }
    }

    public select = (...values: T[]): void =>
        this._updateState(this._markSelected, values)

    public deselect = (...values: T[]): void =>
        this._updateState(this._unmarkSelected, values)

    public toggle(value: T): void {
        this.isSelected(value) ? this.deselect(value) : this.select(value);
    }

    public clear(): void {
        this._selection.forEach(v => this._unmarkSelected(v));
        this._selection.clear();
        this._emitChangeEvent();
    }

    public isSelected(value: T): boolean {
        return this._selection.has(value.id);
    }

    public isEmpty(): boolean {
        return this._selection.size === 0;
    }

    public hasValue(): boolean {
        return !this.isEmpty();
    }

    public snapshot() {
        this._selectionSnapshot = cloneDeep(this._selection);
    }

    public destroy() {
        this._selection.clear();
        this._selectionSnapshot.clear();
    }

    private _updateState = (predicate: (value: T) => void, values: T[]) => {
        values.forEach(predicate);
        this._emitChangeEvent();
    }

    private _emitChangeEvent() {
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
    }

    private _unmarkSelected = (value: T) => {
        if (this.isSelected(value)) {
            this._selection.delete(value.id);

            if (this._emitChanges) {
                this._deselectedToEmit.push(value);
            }
        }
    }
}

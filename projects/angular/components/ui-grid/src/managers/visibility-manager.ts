import { isDevMode } from '@angular/core';

import { isEqual } from 'lodash-es';
import { BehaviorSubject } from 'rxjs';
import {
    filter,
    map,
} from 'rxjs/operators';

import { UiGridColumnDirective } from '../body/ui-grid-column.directive';
import {
    IGridDataEntry,
    IVisibleModel,
} from '../models';

interface IVisibleDiff {
    property: string;
    checked: boolean;
}
/**
 * @internal
 * @ignore
 */
export class VisibilityManger<T extends IGridDataEntry> {
    private _columns$ = new BehaviorSubject<UiGridColumnDirective<T>[]>([]);
    private _initial?: IVisibleDiff[];

    public columns$ = this._columns$.pipe(
        map(cols => cols.filter(c => !!c.visible)),
    );

    public options$ = this._columns$.pipe(
        map(cols => this._mapToRenderedOptions(cols)),
    );

    public isDirty$ = this.options$.pipe(
        filter(() => !!this._initial),
        map(o =>
            ([
                o.map(this._mapToVisibleDiff),
                this._initial,
            ]),
        ),
        map(([current, initial]) => !isEqual(current, initial)),
    );

    public set columns(columns: UiGridColumnDirective<T>[]) {
        if (!this._initial) {
            this._initial = this._mapInitial(columns);
        }

        this._columns$.next(columns);
    }

    public destroy() {
        this._columns$.complete();
    }

    public reset() {
        if (!this._initial) { return; }

        this.update(
            this._initial
                .filter(o => o.checked)
                .map(o => o.property),
        );
    }

    public update(visibleColumnsByProps: Array<string | keyof T>) {
        // changing the visible attribute will trigger a SimpleChange Emission
        this._columns$.getValue()
            .forEach(c => c.visible = visibleColumnsByProps.includes(c.property!));
    }

    private _mapColumnOption = (column: UiGridColumnDirective<T>) => ({
        property: column.property!,
        label: column.title,
        checked: column.visible,
        disabled: column.disableToggle,
    }) as IVisibleModel<T>

    private _mapToVisibleDiff = ({ checked, property }: IVisibleModel<T>) => ({
        property,
        checked,
    } as IVisibleDiff)

    private _mapInitial = (columns: UiGridColumnDirective<T>[]) =>
        this._mapOptions(columns).map(this._mapToVisibleDiff)

    private _mapOptions = (columns: UiGridColumnDirective<T>[]) =>
        columns
            .filter(c => c.property
                // discard locked and hidden columns from toggle-able options
                && (!c.disableToggle || c.visible),
            )
            .map(this._mapColumnOption)

    private _mapToRenderedOptions = (columns: UiGridColumnDirective<T>[]) => {
        const columnOptions = this._mapOptions(columns);

        const visibleOptions = columnOptions.filter(o => o.checked);

        // ensure at least one column is locked as visible
        if (visibleOptions.length && !visibleOptions.find(o => o.disabled)) {
            const firstColumn = columns.find(c => c.property === visibleOptions[0].property)!;

            if (isDevMode()) {
                console.warn(`Did not find column with [disableToggle]="true", locking '${firstColumn.property}' column`);
            }

            firstColumn.disableToggle = true;
            visibleOptions[0].disabled = true;
        }

        return columnOptions;
    }
}

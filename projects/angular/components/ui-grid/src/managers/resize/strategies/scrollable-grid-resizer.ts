import { UiGridColumnDirective } from '../../../body/ui-grid-column.directive';
import { IGridDataEntry } from '../../../models';
import {
    IResizeInfo,
    IResizeState,
    ResizeEmission,
} from '../../resize/types';
import { ResizeDirection } from '../../resize/types/resizeDirection';
import { IResizeEvent } from '../../resize/types/resizeEvent';
import { clampColumnOffset } from '../resize-manager.constants';
import { ImmediateNeighbourHaltResizer } from './immediate-neighbour-halt-resizer';

export const MAXIMUM_STICKY_COVERAGE = 0.7;
export const MAX_COLUMN_WIDTH = 800;
export const MINIMUM_COLUMN_WIDTH = 50;

export class ScrollableGridResizer<T extends IGridDataEntry> extends ImmediateNeighbourHaltResizer<T> {
    limitStickyWidthCoverage(tableContainerWidth: number) {
        const stickyColumnsWidthSum = this._getStickyColumnsWidthSum();

        if (!tableContainerWidth || !stickyColumnsWidthSum) { return; }
        const exceedingStickyCoverageLimit = stickyColumnsWidthSum / tableContainerWidth > MAXIMUM_STICKY_COVERAGE;

        if (exceedingStickyCoverageLimit) {
            const scalingFactor = (tableContainerWidth / stickyColumnsWidthSum) * MAXIMUM_STICKY_COVERAGE;
            this._grid.columns.filter(c => c.isSticky).forEach(column => {
                column.width = column.widthPx$.value * scalingFactor;
            });
            this.resize$.next();
        }
    }

    protected _resizeLeftFilter = (state: IResizeEvent<T>) => {
        if (state.current.direction !== ResizeDirection.Left) { return true; }
        const columnMinWidth = state.current.resized.column.minWidth;
        if (state.current.resized.column.widthPx$.value <= columnMinWidth) {
            this._simulateStopFor(state.current.event, state.current.resized, state.current.oppositeNeighbour);
            return false;
        }

        return true;
    };

    protected _resizeRightFilter = (state: IResizeEvent<T>) => {
        if (state.current.direction !== ResizeDirection.Right) { return true; }

        const exceedingStickyCoverageLimit = this._isLastStickyColumn(state) && this._isExceedingStickyCoverageLimit();
        const isColumnTooLarge = state.current.resized.column.widthPx$.value >= MAX_COLUMN_WIDTH;
        if (exceedingStickyCoverageLimit || isColumnTooLarge) {
            this._simulateStopFor(state.current.event, state.current.resized, state.current.neighbour);
            return false;
        }
        return true;
    };

    protected _stateUpdate = (state: IResizeEvent<T>) => {
        const deltaPx = clampColumnOffset(
            state.current.resized.column.widthPx$.value,
            state.current.resized.column.minWidth,
            state.deltaPx,
        );
        this._applyOffsetFor(state.current.resized, deltaPx);
    };

    protected _applyOffsetFor(entry: IResizeInfo<T> | undefined, offset: number) {
        if (!entry) { return; }
        const clamped = this._clampOffsetForLastStickyColumn(offset, entry.column);
        const widthPx = entry.column.widthPx$.value + clamped;
        entry.column.widthPx$.next(Math.max(MINIMUM_COLUMN_WIDTH, Math.min(widthPx, MAX_COLUMN_WIDTH)));
    }

    protected _emitNewColumnPercentages(entries: (IResizeInfo<T>)[]) {
        const resizeEmissions: ResizeEmission = {};
        entries.forEach(entry => {
            const columnWidth = entry.column.widthPx$.value;
            const initialValue = +entry!.column.width;
            const finalValue = columnWidth;

            if (initialValue !== finalValue) {
                resizeEmissions[(entry.column?.property ?? '').toString()] = {
                    initialValue,
                    finalValue,
                };
            }

            entry!.column.width = columnWidth;
        });
        this.resizeEmissions$.next(resizeEmissions);
    }

    protected _endResizeCommon(..._entries: (IResizeInfo<T> | undefined)[]) {
        this.previousClientX = 0;
        this._previous = {} as IResizeState<T>;
    }

    private _isLastStickyColumn(state: IResizeEvent<T>) {
        return state.current.resized.element.classList.contains('ui-grid-sticky-element') &&
            !state.current.neighbour?.element.classList.contains('ui-grid-sticky-element');
    }

    private _isExceedingStickyCoverageLimit() {
        const stickyContainerWidth = this._getStickyColumnsWidthSum();
        const tableContainerWidth = this._table!.getBoundingClientRect().width;

        return (stickyContainerWidth / tableContainerWidth) > MAXIMUM_STICKY_COVERAGE;
    }

    private _getStickyColumnsWidthSum() {
        return this._grid.columns.filter(c => c.isSticky).reduce((acc, curr) => acc + curr.widthPx$.value, 0);
    }

    private _clampOffsetForLastStickyColumn(offset: number, column: UiGridColumnDirective<T>) {
        if (!column.isSticky) { return offset; }
        const stickyColumnsWidthSum = this._getStickyColumnsWidthSum();
        const tableContainerWidth = this._table!.getBoundingClientRect().width;
        const stickyCoverage = (stickyColumnsWidthSum + offset) / tableContainerWidth;
        if (stickyCoverage > MAXIMUM_STICKY_COVERAGE) {
            return Math.max(0, tableContainerWidth * MAXIMUM_STICKY_COVERAGE - stickyColumnsWidthSum);
        }
        return offset;
    }
}


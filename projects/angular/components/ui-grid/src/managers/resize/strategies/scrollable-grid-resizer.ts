import { UiGridColumnDirective } from '../../../body/ui-grid-column.directive';
import { IGridDataEntry } from '../../../models';
import { ResizeManager } from '../resize-manager';
import {
    clampOffset,
    isDirectionChanged,
    isMinWidth,
} from '../resize-manager.constants';
import {
    IResizeEvent,
    ResizeDirection,
} from '../types';

/**
 * @internal
 * @ignore
 */
export class ScrollableGridResizer<T extends IGridDataEntry> extends ResizeManager<T> {
    private readonly _maxTableCoverage = 0.6;

    initialize = () => {
        this._grid.windowResize$.subscribe(() => {
            this._restrictFrozenColumnsTotalWidth();
        });
    };

    protected _stateFilter = (state: IResizeEvent<T>) => {
        if (isDirectionChanged(state)) {
            // if the direction has changed while actively resizing
            // simulate a stop/start to reset the stored offset
            this._simulateStopFor(state.current.event, state.current.resized, state.previous.neighbour, state.previous.oppositeNeighbour);
            return false;
        }

        return true;
    };

    protected _resizeLeftFilter = (state: IResizeEvent<T>) => {
        if (state.current.direction !== ResizeDirection.Left) { return true; }

        // if the resize limit is reached simulate a stop
        if (isMinWidth(state.current.resized)) {
            this._simulateStopFor(state.current.event, state.current.resized, state.current.oppositeNeighbour);
            return false;
        }

        return true;
    };

    protected _resizeRightFilter = (state: IResizeEvent<T>) => {
        if (state.current.direction !== ResizeDirection.Right) { return true; }

        if (
            isMinWidth(state.current.neighbour) ||
            !state.current.neighbour
        ) {
            this._simulateStopFor(state.current.event, state.current.resized, state.current.neighbour);
            return false;
        }

        if (state.current.resized.column.isFrozen
            && !state.current.neighbour.column.isFrozen
            && this._isMaxWidthForLastFrozenColumn(state)) {

            this._simulateStopFor(state.current.event, state.current.resized, state.current.neighbour);
            return false;
        }

        return true;
    };

    protected _stateUpdate = (state: IResizeEvent<T>) => {
        if (state.current.direction === ResizeDirection.Left) {
            const offset = clampOffset(state.current.resized, state.current.offsetPercent);

            // reduce the current column width
            // or the left neighbour width
            this._applyOffsetFor(state.current.resized, offset);
            // if resize is possible add to the right neighbour's width
            // in order to preserve the total width
            this._applyOffsetFor(state.current.oppositeNeighbour, -offset);
        }

        if (state.current.direction === ResizeDirection.Right) {
            const offset = -clampOffset(state.current.neighbour, -state.current.offsetPercent);

            // reduce width of the right neighbour
            this._applyOffsetFor(state.current.neighbour, -offset);
            // add the stolen width to the actively resized column
            this._applyOffsetFor(state.current.resized, offset);
        }
    };

    private _getColumnWidth(column: UiGridColumnDirective<T>) {
        return parseInt(column.width.toString(), 10);
        // return column.width as number;
    }

    private _isMaxWidthForLastFrozenColumn(state: IResizeEvent<T>) {
        const lastFrozenColumn = state.current.resized.column;

        let totalWidthPercent = 0;
        for (const column of this._definitions!) {
            if (column === lastFrozenColumn) {
                break;
            }

            totalWidthPercent += this._getColumnWidth(column);
        }

        // calculate the current width for the lastFrozenColumn
        const offset = clampOffset(state.current.resized, state.current.offsetPercent);
        totalWidthPercent += parseInt(lastFrozenColumn.width.toString(), 10) + offset;

        return totalWidthPercent >= this._getMaxFrozenColumnsCoveragePercent();

        // const maxWidth = 200;
        // return !!entry && parseInt(entry.element.style.width!, 10) >= maxWidth;
    }

    private _restrictFrozenColumnsTotalWidth() {
        let totalWidthPercent = 0;
        let totalWidthMinusLastFrozenColumnPercent: number;

        let lastFrozenColumn: UiGridColumnDirective<T>;
        let lastFrozenColumnIndex: number;
        let firstFreeColumnIndex: number;

        if (!this._definitions!.length || !this._definitions![0].isFrozen) {
            // no frozen columns
            return;
        }

        for (let i = 0; i < this._definitions!.length; i++) {
            if (!this._definitions![i].isFrozen) {
                break;
            }

            if (i + 1 === this._definitions!.length || !this._definitions![i + 1].isFrozen) {
                totalWidthMinusLastFrozenColumnPercent = totalWidthPercent;
                lastFrozenColumn = this._definitions![i];
                lastFrozenColumnIndex = i;

                if (i + 1 < this._definitions!.length) {
                    firstFreeColumnIndex = i + 1;
                }
            }

            totalWidthPercent += this._getColumnWidth(this._definitions![i]);
        }

        const maxCoveragePercent = this._getMaxFrozenColumnsCoveragePercent();

        if (totalWidthPercent >= maxCoveragePercent) {
            // the frozen columns are taking a lot of space
            // we will reduce the width of the last frozen column and increase the width of the first free column
            const lastFrozenColumnNecessaryWidthPercent =
                Math.max(lastFrozenColumn!.minWidth, maxCoveragePercent - totalWidthMinusLastFrozenColumnPercent!);

            const lastFrozenColumnInitialWidthPercent = this._getColumnWidth(lastFrozenColumn!);

            const lastFrozenColumnResizeInfo = this._getResizedPairAt(lastFrozenColumnIndex!);
            this._applyWidthFor(lastFrozenColumnResizeInfo, lastFrozenColumnNecessaryWidthPercent);

            const firstFreeColumnResizeInfo = this._getResizedPairAt(firstFreeColumnIndex!);
            this._applyOffsetFor(firstFreeColumnResizeInfo,
                lastFrozenColumnInitialWidthPercent! - lastFrozenColumnNecessaryWidthPercent!);

            this.programmaticalResize$.next(true);
        }
    }

    private _getMaxFrozenColumnsCoveragePercent() {
        const visibleGridWidthPx = this._table!.clientWidth;
        const visibleGridWidthPercent = visibleGridWidthPx / this._uiGridTable!.clientWidth * 1000;
        const maxCoveragePercent = this._maxTableCoverage * visibleGridWidthPercent;
        return maxCoveragePercent;
    }

}

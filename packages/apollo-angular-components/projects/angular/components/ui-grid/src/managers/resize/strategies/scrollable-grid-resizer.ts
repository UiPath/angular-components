import { IGridDataEntry } from '../../../models';
import { IResizeInfo } from '../../resize/types';
import { ResizeDirection } from '../../resize/types/resizeDirection';
import { IResizeEvent } from '../../resize/types/resizeEvent';
import {
    clampColumnOffset,
    elementWidth,
} from '../resize-manager.constants';
import { ImmediateNeighbourHaltResizer } from './immediate-neighbour-halt-resizer';

export const MAXIMUM_STICKY_COVERAGE = 0.7;
export const MIN_WIDTH_SCALING_FACTOR = 1.25;
export class ScrollableGridResizer<T extends IGridDataEntry> extends ImmediateNeighbourHaltResizer<T> {
    limitStickyWidthCoverage(tableContainerWidth: number) {
        const stickyContainerWidth = elementWidth('.sticky-columns-header-container', this._gridElement);
        if (!tableContainerWidth || !stickyContainerWidth) { return; }
        const exceedingStickyCoverageLimit = stickyContainerWidth / tableContainerWidth > MAXIMUM_STICKY_COVERAGE;

        if (exceedingStickyCoverageLimit) {
            const scalingFactor = (tableContainerWidth / stickyContainerWidth) * MAXIMUM_STICKY_COVERAGE;
            this._grid.columns.filter(c => c.isSticky).forEach(column => {
                this._widthMap.set(column.identifier, Number(column.width) * scalingFactor);
                column.width = Number(column.width) * scalingFactor / 10;
            });

            this.resize$.next(this._widthMap);
        }
    }

    protected _resizeLeftFilter = (state: IResizeEvent<T>) => {
        if (state.current.direction !== ResizeDirection.Left) { return true; }
        const columnMinWidth = state.current.resized.column.minWidth;

        if (state.current.resized.column.widthPx$.value <= columnMinWidth) {
            return false;
        }

        return true;
    };

    protected _resizeRightFilter = (state: IResizeEvent<T>) => {
        if (state.current.direction !== ResizeDirection.Right) { return true; }

        const exceedingStickyCoverageLimit = this._isLastStickyColumn(state) && this._isExceedingStickyCoverageLimit();

        if (exceedingStickyCoverageLimit) {
            this._simulateStopFor(state.current.event, state.current.resized, state.current.neighbour);
            return false;
        }
        return true;
    };

    protected _stateUpdate = (state: IResizeEvent<T>) => {
        const deltaPx = clampColumnOffset(
            state.current.resized.column.widthPx$.value,
            state.current.resized.column.minWidth * MIN_WIDTH_SCALING_FACTOR,
            state.deltaPx,
        );

        this._applyOffsetFor(state.current.resized, deltaPx);
    };

    protected _applyOffsetFor(entry: IResizeInfo<T> | undefined, offset: number) {
        if (!entry) { return; }

        const widthPx = entry.column.widthPx$.value + offset;
        entry.column.widthPx$.next(widthPx);
    }

    private _isLastStickyColumn(state: IResizeEvent<T>) {
        return state.current.resized.element.classList.contains('ui-grid-sticky-element') &&
            !state.current.neighbour?.element.classList.contains('ui-grid-sticky-element');
    }

    private _isExceedingStickyCoverageLimit() {
        const stickyContainerWidth = elementWidth('.sticky-columns-header-container', this._table!);
        const tableContainerWidth = this._table!.getBoundingClientRect().width;

        return (stickyContainerWidth / tableContainerWidth) > MAXIMUM_STICKY_COVERAGE;
    }
}


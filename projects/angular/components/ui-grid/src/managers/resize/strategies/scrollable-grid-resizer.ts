import { IGridDataEntry } from '../../../models';
import { ResizeDirection } from '../../resize/types/resizeDirection';
import { IResizeEvent } from '../../resize/types/resizeEvent';
import {
    clampOffset,
    isMinWidth,
    isSticky,
} from '../resize-manager.constants';
import { ImmediateNeighbourHaltResizer } from './immediate-neighbour-halt-resizer';

export const MAXIMUM_STICKY_COVERAGE = 0.7;
export class ScrollableGridResizer<T extends IGridDataEntry> extends ImmediateNeighbourHaltResizer<T> {
    limitStickyWidthCoverage(tableContainerWidth: number) {
        const stickyContainerWidth = this._gridElement!.querySelector('.sticky-columns-header-container')!.getBoundingClientRect().width;
        const exceedingStickyCoverageLimit = stickyContainerWidth / tableContainerWidth > MAXIMUM_STICKY_COVERAGE;

        if (exceedingStickyCoverageLimit) {
            const scalingFactor = (tableContainerWidth / stickyContainerWidth) * MAXIMUM_STICKY_COVERAGE;
            const stickyContainer = this._gridElement!.querySelector('.sticky-columns-header-container') as HTMLDivElement;
            const initialWidth = +stickyContainer.style.width.replace('%', '');
            stickyContainer.style.width = `${initialWidth * scalingFactor}%`;
            this._grid.columns.filter(c => c.isSticky).forEach(column => {
                column.width = +column.width * scalingFactor / 10;
            });

            const stickyCellContainers =
                this._gridElement!.querySelectorAll('.sticky-columns-cell-container') as NodeListOf<HTMLDivElement>;
            stickyCellContainers.forEach(stickyCellContainer => {
                const cellContainerWidth = +stickyCellContainer.style.width.replace('%', '');
                stickyCellContainer.style.width = `${cellContainerWidth * scalingFactor}%`;
            });
        }
    }

    protected _resizeLeftFilter = (state: IResizeEvent<T>) => {
        if (state.current.direction !== ResizeDirection.Left) { return true; }

        let stickyColumnReachedMinWidth = false;
        if (isSticky(state.current.resized.element)) {
            const currentWidth = this._widthMap.get(state.current.resized.column.identifier)!;
            const minWidth = state.current.resized.column.minWidth;
            if (currentWidth <= minWidth) {
                stickyColumnReachedMinWidth = true;
            }
        }

        if ((!isSticky(state.current.resized.element) && isMinWidth(state.current.resized))
            || stickyColumnReachedMinWidth) {
            this._simulateStopFor(state.current.event, state.current.resized, state.current.oppositeNeighbour);
            return false;
        }

        return true;
    };

    protected _resizeRightFilter = (state: IResizeEvent<T>) => {
        if (state.current.direction !== ResizeDirection.Right) { return true; }

        let exceedingStickyCoverageLimit = false;
        let stickyColumnReachedMinWidth = false;

        if (isSticky(state.current.resized.element) && state.current.neighbour) {
            const currentWidth = this._widthMap.get(state.current.neighbour.column.identifier)!;
            const minWidth = state.current.neighbour.column.minWidth;
            if (currentWidth <= minWidth) {
                stickyColumnReachedMinWidth = true;
            }
        }

        if (this._isLastStickyColumn(state)) {
            const stickyContainer = this._table!.querySelector('.sticky-columns-header-container');
            const stickyContainerWidth = stickyContainer!.getBoundingClientRect().width;
            const tableContainerWidth = this._table!.getBoundingClientRect().width;

            exceedingStickyCoverageLimit = (stickyContainerWidth / tableContainerWidth) > MAXIMUM_STICKY_COVERAGE;
        }

        if (!state.current.neighbour ||
            (!isSticky(state.current.neighbour.element) && isMinWidth(state.current.neighbour)) ||
            stickyColumnReachedMinWidth ||
            exceedingStickyCoverageLimit) {
            this._simulateStopFor(state.current.event, state.current.resized, state.current.neighbour);
            return false;
        }
        return true;
    };

    protected _stateUpdate = (state: IResizeEvent<T>) => {
        if (state.current.direction === ResizeDirection.Left) {
            const offset = clampOffset(state.current.resized, state.current.offsetPercent);
            this._applyOffsetFor(state.current.resized, offset);
            this._applyOffsetFor(state.current.oppositeNeighbour, -offset);
        }

        if (state.current.direction === ResizeDirection.Right) {
            let offset = -clampOffset(state.current.neighbour, -state.current.offsetPercent);

            if (this._isLastStickyColumn(state)) {
                const ratio = this._computePixelsToPercentRatio();
                const stickyColumnsPercentageSum = this._grid.columns.filter(c => c.isSticky).map(c => +c.width).reduce((a, b) => a + b, 0);
                const stickyContainerWidth = stickyColumnsPercentageSum / ratio;
                const offsetPx = offset / ratio;
                const tableWidth = this._table!.getBoundingClientRect().width;

                if ((stickyContainerWidth + offsetPx) / tableWidth > MAXIMUM_STICKY_COVERAGE) {
                    offset = Math.max((tableWidth * MAXIMUM_STICKY_COVERAGE - stickyContainerWidth) * ratio, 0);
                }
            }

            this._applyOffsetFor(state.current.neighbour, -offset);
            this._applyOffsetFor(state.current.resized, offset);
        }
    };

    private _isLastStickyColumn(state: IResizeEvent<T>) {
        return state.current.resized.element.classList.contains('ui-grid-sticky-element') &&
            !state.current.neighbour?.element.classList.contains('ui-grid-sticky-element');
    }
}


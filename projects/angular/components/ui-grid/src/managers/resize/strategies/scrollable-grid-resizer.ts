import { IGridDataEntry } from '../../../models';
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
}


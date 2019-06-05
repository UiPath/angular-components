import { IGridDataEntry } from '../../models';
import { ResizeManager } from './resize-manager';
import {
    AggresiveNeighbourPushResizer,
    ImmediateNeighbourHaltResizer,
} from './strategies';
import {
    ResizableGrid,
    ResizeStrategy,
} from './types';

/**
 * @internal
 * @ignore
 */
export const ResizeManagerFactory =
    <T extends IGridDataEntry>(type: ResizeStrategy, grid: ResizableGrid<T>): ResizeManager<T> => {
        switch (type) {
            case ResizeStrategy.PassiveNeighbourPush:
                console.warn(`The ${
                    ResizeStrategy[type]
                } strategy is not yet supported. It will default to ${
                    ResizeStrategy[ResizeStrategy.AggresiveNeighbourPush]
                }`);
                return new AggresiveNeighbourPushResizer(grid);
            case ResizeStrategy.AggresiveNeighbourPush:
                return new AggresiveNeighbourPushResizer(grid);
            case ResizeStrategy.ImmediateNeighbourHalt:
                return new ImmediateNeighbourHaltResizer(grid);
        }
    };

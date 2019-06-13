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
export class ImmediateNeighbourHaltResizer<T extends IGridDataEntry> extends ResizeManager<T> {
    protected _stateFilter = (state: IResizeEvent<T>) => {
        if (isDirectionChanged(state)) {
            // if the direction has changed while actively resizing
            // simulate a stop/start to reset the stored offset
            this._simulateStopFor(state.current.event, state.current.resized, state.previous.neighbour, state.previous.oppositeNeighbour);
            return false;
        }

        return true;
    }

    protected _resizeLeftFilter = (state: IResizeEvent<T>) => {
        if (state.current.direction !== ResizeDirection.Left) { return true; }

        // if the resize limit is reached simulate a stop
        if (isMinWidth(state.current.resized)) {
            this._simulateStopFor(state.current.event, state.current.resized, state.current.oppositeNeighbour);
            return false;
        }

        return true;
    }

    protected _resizeRightFilter = (state: IResizeEvent<T>) => {
        if (state.current.direction !== ResizeDirection.Right) { return true; }

        if (
            isMinWidth(state.current.neighbour) ||
            !state.current.neighbour
        ) {
            this._simulateStopFor(state.current.event, state.current.resized, state.current.neighbour);
            return false;
        }

        return true;
    }

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
    }
}

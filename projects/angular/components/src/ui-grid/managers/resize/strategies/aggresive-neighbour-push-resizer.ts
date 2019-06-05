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
export class AggresiveNeighbourPushResizer<T extends IGridDataEntry> extends ResizeManager<T> {
    private _isWidthLimitReached = false;

    public setupState(ev: MouseEvent, column: UiGridColumnDirective<T>) {
        super.setupState(ev, column);
        this._isWidthLimitReached = false;
    }

    protected _stateFilter = (state: IResizeEvent<T>) => {
        if (isDirectionChanged(state)) {
            // if the direction has changed while actively resizing
            // simulate a stop/start to reset the stored offset
            this._simulateStopFor(
                state.current.event!,
                state.current.resized,
                state.previous.neighbour!,
                state.previous.oppositeNeighbour!,
            );
            return false;
        }

        if (isMinWidth(state.current.neighbour)) {
            // if the current pushed column has reached its width limit
            // simulate a stop/start to reset the stored offset
            this._simulateStopFor(state.current.event, state.current.resized, state.current.neighbour, state.current.oppositeNeighbour);

            // update the neighbour offset
            this._neighbourIndexOffset += state.current.direction;
            return false;
        }

        return true;
    }

    protected _resizeLeftFilter = (state: IResizeEvent<T>) => {
        if (state.current.direction !== ResizeDirection.Left) { return true; }

        // if the current column reached the minimum
        // and there are no more neighbours left, skip
        if (
            isMinWidth(state.current.resized) &&
            !state.current.neighbour ||
            isMinWidth(state.current.neighbour)
        ) { return false; }

        // if the resize limit is reached, then mark it
        // and simulate a stop
        if (
            !this._isWidthLimitReached &&
            isMinWidth(state.current.resized)
        ) {
            this._simulateStopFor(state.current.event!, state.current.resized, state.current.oppositeNeighbour!);
            this._isWidthLimitReached = true;
            return false;
        }

        return true;
    }

    protected _resizeRightFilter = (state: IResizeEvent<T>) => {
        if (state.current.direction !== ResizeDirection.Right) { return true; }

        // reset width limit flag
        this._isWidthLimitReached = false;

        if (
            isMinWidth(state.current.neighbour) ||
            !state.current.neighbour
        ) {
            this._simulateStopFor(state.current.event!, state.current.resized, state.current.neighbour);
            return false;
        }

        return true;
    }

    protected _stateUpdate = (state: IResizeEvent<T>) => {
        if (state.current.direction === ResizeDirection.Left) {
            // determine reduced column
            const active = isMinWidth(state.current.resized) ?
                state.current.neighbour! :
                state.current.resized!;

            const offset = clampOffset(active, state.current.offsetPercent);
            // reduce the current column width
            // or the left neighbour width
            this._applyOffsetFor(active, offset);
            // if resize is possible add to the right neighbours width
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

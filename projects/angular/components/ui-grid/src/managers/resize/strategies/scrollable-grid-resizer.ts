import { IGridDataEntry } from '../../../models';
import { ImmediateNeighbourHaltResizer } from './immediate-neighbour-halt-resizer';

export class ScrollableGridResizer<T extends IGridDataEntry> extends ImmediateNeighbourHaltResizer<T> {
    // TODO: check if sticky columns exceeded width limit
}


import { ResizeDirection } from './resizeDirection';
import { IResizeInfo } from './resizeInfo';

/**
 * @internal
 * @ignore
 */
export interface IResizeState<T> {
    resized: IResizeInfo<T>;
    neighbour?: IResizeInfo<T>;
    oppositeNeighbour?: IResizeInfo<T>;
    offsetPx: number;
    offsetPercent: number;
    direction: ResizeDirection;
    event?: MouseEvent;
}

import { IResizeState } from './resizeState';

/**
 * @internal
 * @ignore
 */
export interface IResizeEvent<T> {
    current: IResizeState<T>;
    previous: IResizeState<T>;
}

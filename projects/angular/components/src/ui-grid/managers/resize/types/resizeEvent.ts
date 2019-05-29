import { IResizeState } from './resizeState';

export interface IResizeEvent<T> {
    current: IResizeState<T>;
    previous: IResizeState<T>;
}

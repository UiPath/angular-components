import { UiGridColumnDirective } from '../../../body';

/**
 * @internal
 * @ignore
 */
export interface IResizeInfo<T> {
    column: UiGridColumnDirective<T>;
    element: HTMLDivElement;
    cells: HTMLDivElement[];
    index: number;
    dragInitX?: number;
}

import { UiGridColumnDirective } from '../../../body';

export interface IResizeInfo<T> {
    column: UiGridColumnDirective<T>;
    element: HTMLDivElement;
    cells: HTMLDivElement[];
    index: number;
    dragInitX?: number;
}

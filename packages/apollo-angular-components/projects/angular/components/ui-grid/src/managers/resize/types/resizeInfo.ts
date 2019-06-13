import { UiGridColumnDirective } from '../../../body/ui-grid-column.directive';

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

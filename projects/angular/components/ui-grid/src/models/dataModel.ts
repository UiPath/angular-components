import { ResizeStrategy } from '../managers';

/**
 * The grid entry schema.
 *
 * @export
 */
export interface IGridDataEntry {
    /**
     * The identifier associated to the current row item.
     *
     * Used to track multi-page selections / optimize rendering.
     */
    id: number | string;
}
/**
 * Grid options.
 * `useLegacyDesign` if you still need the old layout
 * `collapsibleFilters` is deprecated, use `collapseFiltersCount` instead
 * `fetchStrategy` controls how searchable filters will emit queries on render
 *
 * @export
 */
export interface GridOptions<T> {
    useCache?: boolean;
    fetchStrategy?: 'eager' | 'onOpen';
    useLegacyDesign?: boolean;
    collapsibleFilters?: boolean;
    collapseFiltersCount?: number;
    idProperty?: keyof T;
    rowSize?: number;
    resizeStrategy?: ResizeStrategy;
}

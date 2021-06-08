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
 * `fetchStrategy` controls when searchable filters will emit queries post render
 *
 * @export
 */
export interface GridOptions<T> {
    useCache?: boolean;
    fetchStrategy?: 'eager' | 'onOpen';
    useAlternateDesign?: boolean;
    collapsibleFilters?: boolean;
    idProperty?: keyof T;
    rowSize?: number;
}

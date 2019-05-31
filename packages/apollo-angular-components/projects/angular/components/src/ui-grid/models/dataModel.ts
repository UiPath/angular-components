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

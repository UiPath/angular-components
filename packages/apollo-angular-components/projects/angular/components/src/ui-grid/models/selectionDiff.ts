/**
 * Selection difference schema.
 *
 * Used for selection snapshot comparisons.
 *
 * @export
 */
export interface ISelectionDiff<T> {
    /**
     * The added list.
     *
     */
    add: Partial<T>[];
    /**
     * The removed list.
     *
     */
    remove: Partial<T>[];
}

/**
 * The filter model schema.
 *
 * @export
 */
export interface IFilterModel<T> {
    /**
     * The targeted entity property.
     *
     */
    property: keyof T | string;
    /**
     * Filter method metadata.
     *
     * eg: `equals`, `greaterThan`, etc.
     *
     */
    method: string;
    /**
     * The current filter value.
     *
     */
    value: FilterValue | FilterValue[] | [] | undefined | null;
    /**
     * Type metadata.
     *
     * eg: `string`, `number`, etc.
     *
     */
    type?: string;
}

export type FilterValue = string | number | Date | boolean;

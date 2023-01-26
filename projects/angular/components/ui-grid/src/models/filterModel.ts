import { ISuggestValueData } from '@uipath/angular/components/ui-suggest';

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
    value: string | number | Date | boolean | [] | undefined | null;
    /**
     * Type metadata.
     *
     * eg: `string`, `number`, etc.
     *
     */
    type?: string;
    /**
     * The current filter meta.
     * This will be additional suggest data sent to search filters in case you need more than the id from suggest.
     *
     */
    meta?: ISuggestValueData<T> | ISuggestValueData<T>[] | null;
}

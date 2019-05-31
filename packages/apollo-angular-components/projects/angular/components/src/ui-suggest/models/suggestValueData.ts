import { ISuggestValue } from './suggestValue';

/**
 * UiSuggest item with data schema.
 *
 * @export
 */
export interface ISuggestValueData<T> extends ISuggestValue {
    /**
     * Data associated to the entry item.
     *
     */
    data?: T;
}

import { ISuggestValue } from './suggestValue';

/**
 * UiSuggest item with data schema.
 *
 * @export
 */
export interface ISuggestValueData<T> extends ISuggestValue {
    /**
     * Data associtaed to the entry item.
     *
     */
    data?: T;
}

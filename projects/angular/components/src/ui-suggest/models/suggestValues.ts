import { ISuggestValueData } from './suggestValueData';

/**
 * Fetch value schema.
 *
 * @export
 */
export interface ISuggestValues<T> {
    /**
     * The response data.
     *
     */
    data?: ISuggestValueData<T>[];
    /**
     * The total available item count. (used to determine chunks for lazy-loading)
     *
     */
    total?: number;
}

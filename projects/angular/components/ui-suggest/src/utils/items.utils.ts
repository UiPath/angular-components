import { isDevMode } from '@angular/core';
import { VirtualScrollItemStatus } from '@uipath/angular/directives/ui-virtual-scroll-range-loader';

import cloneDeep from 'lodash-es/cloneDeep';
import sortBy from 'lodash-es/sortBy';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';

import {
    ISuggestValue,
    ISuggestValueData,
    ISuggestValues,
    SuggestDisplayPriority,
} from '../models';

/**
* Case-insensitive comparer.
*
* @param str1 Left hand input.
* @param str2 Right hand input.
* @returns If the strings are equal.
* @ignore
*/
export const caseInsensitiveCompare = (str1: string, str2: string): boolean => str1.trim().toLowerCase() === str2.trim().toLowerCase();

/**
 * Warns the developer that the provided item collection is falsy.
 * @ignore
 */
function arrayWarning(value: any) {
    if (!isDevMode()) { return; }

    if (!(value instanceof Array)) {
        console.warn(`The 'value': ${JSON.stringify(value, null, 4)} should be of type Array!`);
    }
}

/**
 * Warns the developer that the provided item collection contains falsy values.
 * @ignore
 */
function nullValueWarning(value: any) {
    if (!isDevMode()) { return; }

    if (
        !value ||
        value instanceof Array &&
        value.some(v => v == null)
    ) {
        console.warn(`The provided 'value': ${JSON.stringify(value, null, 4)} contains 'undefined' entries, they will be removed!`);
    }
}

/**
 * Sorts the items according to their display priority.
 * @returns The sorted items.
 * @ignore
 */
function applyDisplayPriority(mappedItems: ISuggestValue[], displayPriority: SuggestDisplayPriority, value: ISuggestValue[]) {
    if (displayPriority === 'selected') {
        return sortBy(mappedItems, [(item: ISuggestValue) => !value.find(v =>
            v.id === item.id &&
            v.text === item.text,
        ), 'text']);
    }

    return mappedItems;
}

/**
 * Filtering utility with `limit`.
 *
 * @param arr The collection that needs to be filtered.
 * @param predicate The filter predicate.
 * @param [limit=0] Halts filtering if the `limit` amount of items have been found using the `predicate`.
 * @returns The filtering result.
 * @ignore
 */
function filterItemsByPredicate(
    arr: ISuggestValue[],
    predicate: (item: ISuggestValue) => boolean,
    limit = 0,
) {
    const results = [];

    for (const item of arr) {
        if (
            limit > 0 &&
            results.length === limit
        ) { break; }

        if (predicate(item)) {
            results.push(item);
        }
    }

    return results;
}

/**
* Generates an in memory search factory.
*
* @param searchTerm The term searched for.
* @param sourceList The items that need to be filtered.
* @ignore
*/
export const inMemorySearch = (searchTerm: string, sourceList: ISuggestValue[]) =>
    of(sourceList)
        .pipe(
            map(items => {
                const data = filterItemsByPredicate(items,
                    item =>
                        item.text.toLowerCase().includes(searchTerm.toLowerCase()),
                );
                return {
                    data,
                    total: data.length,
                } as ISuggestValues<any>;
            }),
        );

/**
 * Clears falsy values from the array.
 *
 * @export
 * @param value The value that needs to be normalized.
 * @returns The normalized value.
 * @ignore
 */
export function checkAndNormalizeValue(value: ISuggestValue[]) {
    arrayWarning(value);
    nullValueWarning(value);

    const clone = cloneDeep(value);
    if (clone == null) {
        return [];
    }

    if (clone.some((v: any) => v == null)) {
        return clone.filter((v: any) => v != null);
    }

    return clone;
}

/**
 * Sorts the items according to the configured display priority and render direction.
 *
 * @export
 * @param data The item list that needs to be sorted.
 * @param displayPriority The requested display priority.
 * @param value The selected items.
 * @param isDown If the dropdown direction is `down`.
 * @returns The sorted item array.
 * @ignore
 */
export function sortByPriorityAndDirection(
    data: ISuggestValue[],
    displayPriority: SuggestDisplayPriority,
    value: ISuggestValue[],
    isDown: boolean,
) {
    const mappedItems = applyDisplayPriority(data, displayPriority, value);
    return isDown ? mappedItems : mappedItems.reverse();
}

/**
 * @ignore
 */
export function mapInitialItems(
    { total = 0, data = [] }: ISuggestValues<any>,
    displayPriority: SuggestDisplayPriority,
    value: ISuggestValue[],
    loadingLabel: string,
    isDown: boolean,
) {
    const loadingLength = total - data.length;
    const queryResponse = data.map(r => ({ ...r, loading: VirtualScrollItemStatus.loaded }));
    const mappedItems = applyDisplayPriority(queryResponse, displayPriority, value);
    const loadingItems = generateLoadingInitialCollection(loadingLabel, loadingLength);

    const responseResults = [
        ...mappedItems,
        ...loadingItems,
    ];

    return isDown ? responseResults : responseResults.reverse();
}

/**
 * @ignore
 */
export function generateLoadingInitialCollection(text: string, total = 0): ISuggestValue[] {
    return new Array(total)
        .fill(0)
        .map(
            () => ({
                id: -1,
                text,
                loading: VirtualScrollItemStatus.initial,
            }),
        );
}

/**
 * @ignore
 */
export function setLoadedState(data: ISuggestValueData<any>[], start: number, currentItems: ISuggestValue[]) {
    const items = [...currentItems];
    data
        .map(r => ({ ...r, loading: VirtualScrollItemStatus.loaded }))
        .forEach((item, chunkIndex) => {
            const itemIndex = chunkIndex + start;
            if (items[itemIndex] && items[itemIndex].loading !== VirtualScrollItemStatus.loaded) {
                items[itemIndex] = item;
            }
        });
    return items;
}

/**
 * @ignore
 */
export function toSuggestValue(inputValue: ISuggestValue | string, isCustom: boolean = false) {
    return typeof inputValue === 'string' ?
        {
            id: inputValue.trim(),
            text: inputValue.trim(),
            loading: VirtualScrollItemStatus.loaded,
            isCustom,
        } as ISuggestValue :
        inputValue;
}

/**
 * @ignore
 */
export function resetUnloadedState(items: ISuggestValue[], mappedStart: number, mappedEnd: number) {
    items.slice(mappedStart, mappedEnd)
        .filter(item => item.loading === VirtualScrollItemStatus.pending)
        .forEach((item) => {
            item.loading = VirtualScrollItemStatus.initial;
        });
}

/**
 * @ignore
 */
export function setPendingState(items: ISuggestValue[], mappedStart: number, mappedEnd: number) {
    items.slice(mappedStart, mappedEnd)
        .filter(item => item.loading === VirtualScrollItemStatus.initial)
        .forEach((item) => {
            item.loading = VirtualScrollItemStatus.pending;
        });
}

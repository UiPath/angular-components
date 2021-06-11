import assignWith from 'lodash-es/assignWith';
import cloneDeep from 'lodash-es/cloneDeep';
import difference from 'lodash-es/difference';
import get from 'lodash-es/get';
import isArray from 'lodash-es/isArray';
import isDate from 'lodash-es/isDate';
import isObject from 'lodash-es/isObject';
import * as hash from 'object-hash';
import { BehaviorSubject } from 'rxjs';

import { isDevMode } from '@angular/core';

import {
    GridOptions,
    IGridDataEntry,
} from '../models';

/**
 * @ignore
 * @internal
 */
const customPatch = (left: any, right: any): any => {
    if (
        !isArray(left) && !isArray(right) &&
        !isDate(left) && !isDate(right) &&
        isObject(left) && isObject(right)
    ) {
        return assignWith(left, right, customPatch);
    }
};

/**
 * @ignore
 * @internal
 */
type PropertyMap<T> = { [Key in keyof T]?: PropertyMap<T[Key]> };

type StringOrNumberKeyOf<T> = keyof T & (string | number);

/**
 * The data manager increases rendering performance drastically updating the dataset.
 * By updating the references directly (when having set useCache: true – default: false)
 * * the renderer will update the invidivual cells rather than redraw the entire row
 * * increasing / decreasing data count will result in less node insertion / removal
 *
 * @export
 * @ignore
 * @internal
 */
export class DataManager<T extends IGridDataEntry, K extends StringOrNumberKeyOf<T> = StringOrNumberKeyOf<T>> {

    public useCache: boolean;
    public idProperty: K;

    public get length() {
        return this.data$.value.length;
    }

    constructor(options?: GridOptions<T>) {
        this.useCache = options?.useCache ?? false;
        this.idProperty = options?.idProperty as unknown as K ?? 'id';
    }

    public pristine = true;

    public data$ = new BehaviorSubject<T[]>([]);

    public getProperty = get;

    private _hashMap = new Map<string, string>();

    public forEach = (callbackfn: (value: T, index: number, array: T[]) => void) =>
        this.data$.value.forEach(callbackfn);

    public some = (callbackfn: (value: T, index: number, array: T[]) => boolean) =>
        this.data$.value.some(callbackfn);

    public every = (callbackfn: (value: T, index: number, array: T[]) => boolean) =>
        this.data$.value.every(callbackfn);

    public indexOf(entry: T) {
        return this.data$.value.indexOf(entry);
    }

    public find = <R extends T[K]>(entryId: R) =>
        this.data$.value.find(e => e[this.idProperty] === entryId);

    public get = (index: number) =>
        this.data$.value[index];

    public patchRow(id: T[K], patch: PropertyMap<T>) {
        const entry = this.data$.value.find(e => e[this.idProperty] === id);
        if (!entry) {
            if (isDevMode()) {
                console.warn(`Could not patch entity ${this.idProperty}. Skipping patch...`);
            }
            return;
        }

        if (!this.useCache) {
            const data = this.data$.value.slice(0);
            const index = data.indexOf(entry);

            assignWith(entry, patch, customPatch);
            data.splice(index, 1, { ...entry });
            this.data$.next(data);

            return;
        }

        assignWith(entry, patch, customPatch);

        this._hash(entry);
        this._emit();
    }

    public update(data: T[]) {
        this.pristine = this.pristine &&
            data == null;

        data = cloneDeep(data || []);

        if (!this.useCache) {
            this._emit(data);
            return;
        }

        if (data.some(e => e[this.idProperty] == null)) {
            throw new Error(`The '${this.idProperty}' property is a missing in: ${JSON.stringify(data, null, 4)}`);
        }

        const cache = this.data$.value;

        this._hashMap.clear();
        data.forEach(entry => this._hash(entry));

        if (!cache.length) {
            this._emit(data);
            return;
        }

        if (data.length < cache.length) {
            cache.splice(data.length);
        }

        data.forEach((entry: T, idx: number) => {
            if (idx < cache.length) {
                difference<string>(
                    Object.keys(cache[idx]),
                    Object.keys(entry),
                ).forEach(prop => {
                    const key = prop as keyof T;
                    delete cache[idx][key];
                });

                Object.assign(cache[idx], entry);
            } else {
                cache.push(entry);
            }
        });

        this._emit();
    }

    public destroy() {
        this._hashMap.clear();
        this.data$.complete();
    }

    public hashTrack = (_: number | undefined | null, entry: T) => this._hashMap.get(`${entry[this.idProperty]}`);

    private _hash = (entry: T) =>
        this._hashMap.set(`${entry[this.idProperty]}`, hash.MD5(entry));

    private _emit(data?: T[]) {
        this.data$.next([...(data || this.data$.value)]);
    }
}

import {
    concat,
    Observable,
    ObservableInput,
} from 'rxjs';
import {
    take,
    toArray,
} from 'rxjs/operators';

import { ObservedValueOf } from './internal/observed-value-of';

// tslint:disable: max-line-length
// tslint:disable: valid-js-doc
/**
 * @ignore
 */
export function concatJoin<O1 extends ObservableInput<any>>(v1: O1): Observable<[ObservedValueOf<O1>]>;
/**
 * @ignore
 */
export function concatJoin<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>>(v1: O1, v2: O2): Observable<[ObservedValueOf<O1>, ObservedValueOf<O2>]>;
/**
 * @ignore
 */
export function concatJoin<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>>(v1: O1, v2: O2, v3: O3): Observable<[ObservedValueOf<O1>, ObservedValueOf<O2>, ObservedValueOf<O3>]>;
/**
 * @ignore
 */
export function concatJoin<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>, O4 extends ObservableInput<any>>(v1: O1, v2: O2, v3: O3, v4: O4): Observable<[ObservedValueOf<O1>, ObservedValueOf<O2>, ObservedValueOf<O3>, ObservedValueOf<O4>]>;
/**
 * @ignore
 */
export function concatJoin<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>, O4 extends ObservableInput<any>, O5 extends ObservableInput<any>>(v1: O1, v2: O2, v3: O3, v4: O4, v5: O5): Observable<[ObservedValueOf<O1>, ObservedValueOf<O2>, ObservedValueOf<O3>, ObservedValueOf<O4>, ObservedValueOf<O5>]>;
/**
 * @ignore
 */
export function concatJoin<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>, O4 extends ObservableInput<any>, O5 extends ObservableInput<any>, O6 extends ObservableInput<any>>(v1: O1, v2: O2, v3: O3, v4: O4, v5: O5, v6: O6): Observable<[ObservedValueOf<O1>, ObservedValueOf<O2>, ObservedValueOf<O3>, ObservedValueOf<O4>, ObservedValueOf<O5>, ObservedValueOf<O6>]>;
// tslint:enable: max-line-length
// tslint:enable: valid-js-doc

/**
 * Captures the first emitted value from the provided stream sequence and returns an array with the first emitted value from each.
 *
 * @export
 * @param inputs The input streams.
 * @returns An array with the emitted values.
 */
export function concatJoin(...inputs: Observable<any>[]): Observable<any[]> {
    const streams = inputs.map(input => input.pipe(take(1)));

    return concat(...streams)
        .pipe(
            toArray(),
        );
}

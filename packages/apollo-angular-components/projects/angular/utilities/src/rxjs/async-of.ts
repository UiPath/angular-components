import {
    Observable,
    of,
} from 'rxjs';
import { delay } from 'rxjs/operators';

/**
 * Static operator to avoid breaking the stream when using catchError.
 *
 * @param obj  Object that will be asynchronously returned.
 * @param [delay=0] The delay applied to the stream until it emits the provided value;
 * @returns The delayed stream.
 */
export function asyncOf<T>(obj: T, delayMs = 0): Observable<T> {
    return of(obj).pipe(delay(delayMs));
}

import {
  Observable,
  of,
} from 'rxjs';
import { delay } from 'rxjs/operators';

/**
 * Static operator to avoid breaking the stream when using catchError.
 *
 * @param obj  Object that will be asynchronously returned.
 * @returns The delayed stream.
 */
export function asyncOf<T>(obj: T): Observable<T> {
  return of(obj).pipe(delay(0));
}

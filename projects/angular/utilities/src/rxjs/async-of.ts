import {
  Observable,
  of,
} from 'rxjs';
import { delay } from 'rxjs/operators';

export /**
 * Static operator to avoid breaking the stream when using catchError.
 *
 * @template T
 * @param {T} obj  Object to be asynchronously returned.
 * @returns {Observable<T>} The delay stream.
 */
const asyncOf = <T>(obj: T): Observable<T> => of(obj).pipe(delay(0));

import {
    Observable,
    of,
} from 'rxjs';
import { delay } from 'rxjs/operators';

/**
 * Static operator to avoid breaking the stream when using catchError
 * @param obj - Object to be asynchronously returned
 */
export const asyncOf = <T>(obj: T): Observable<T> => of(obj).pipe(delay(0));

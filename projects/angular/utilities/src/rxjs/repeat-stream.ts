import {
    Observable,
    timer,
} from 'rxjs';
import { switchMap } from 'rxjs/operators';

type StreamFactory<T> = () => Observable<T>;

/**
 * Repeats the requested stream indefinitely.
 *
 * @export
 * @param stream The stream factory.
 * @param [interval=5000] The interval at which to repeat the stream.
 * @returns A hot observable that switches to the provided factory at the requested interval.
 */
export function repeatStream<T>(stream: StreamFactory<T>, interval = 5000) {
    return timer(0, interval)
        .pipe(
            switchMap(() => stream()),
        );
}

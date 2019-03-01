import {
  Observable,
  timer,
} from 'rxjs';
import { switchMap } from 'rxjs/operators';

export    /**
 * Repeats the requested stream indefinately.
 *
 * @template T
 * @param {() => Observable<T>} stream The stream factory.
 * @param {number} [interval=5000] The interval at which to repeat the stream.
 */
    const repeatStream = <T>(stream: () => Observable<T>, interval = 5000) => timer(0, interval)
        .pipe(
            switchMap(() => stream()),
        );

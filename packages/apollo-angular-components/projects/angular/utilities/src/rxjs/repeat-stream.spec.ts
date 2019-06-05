import {
    fakeAsync,
    tick,
} from '@angular/core/testing';

import { of } from 'rxjs';
import {
    finalize,
    take,
} from 'rxjs/operators';

import { repeatStream } from './repeat-stream';

const REPEAT_COUNT_LIST = Array(10)
    .fill(void 0)
    .map((_, idx) => (idx + 1) * 13);

const REPEAT_INTERVAL_LIST = Array(5)
    .fill(void 0)
    .map((_, idx) => (idx + 1) * 1337);

describe('Util(rxjs): repeatStream', () => {
    let emissionCount: number;

    beforeEach(() => {
        emissionCount = 0;
    });

    REPEAT_COUNT_LIST
        .forEach(repeat => {
            REPEAT_INTERVAL_LIST
                .forEach(interval => {
                    it(`should ${repeat} times at an interval of ${interval}`, fakeAsync((done: DoneFn) => {
                        const callbacks = {
                            emission: (count: number) => expect(count).toEqual(emissionCount),
                        };

                        const emissionSpy = spyOn(callbacks, 'emission');
                        emissionSpy.and.callThrough();

                        repeatStream(() => of(++emissionCount), interval)
                            .pipe(
                                take(repeat),
                                finalize(done),
                            )
                            .subscribe(callbacks.emission);

                        for (let i = 0; i < repeat; i++) {
                            tick(interval);
                        }

                        expect(emissionSpy).toHaveBeenCalled();
                        expect(emissionSpy).toHaveBeenCalledTimes(repeat);
                    }));
                });
        });
});

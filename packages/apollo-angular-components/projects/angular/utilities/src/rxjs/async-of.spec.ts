import {
    fakeAsync,
    tick,
} from '@angular/core/testing';

import {
    merge,
    of,
} from 'rxjs';
import {
    finalize,
    share,
    shareReplay,
    skip,
    startWith,
    take,
} from 'rxjs/operators';

import { asyncOf } from './async-of';

interface IDelayedTarget {
    target: string;
}

describe('Util(rxjs): asyncOf', () => {
    it('should emit sync stream first, delayed stream (0ms) second and delayed stream (10ms) third', fakeAsync((done: DoneFn) => {
        const noDelay = of<IDelayedTarget>({ target: 'noDelay' });
        const delay0 = asyncOf<IDelayedTarget>({ target: 'delay0' });
        const delay10 = asyncOf<IDelayedTarget>({ target: 'delay10' }, 10);

        const emissions$ = merge(
            delay10,
            delay0,
            noDelay,
        ).pipe(
            take(3),
            share(),
            finalize(done),
        );

        const callbacks = {
            noDelay: (obj: IDelayedTarget) => expect(obj.target).toEqual('noDelay'),
            delay0: (obj: IDelayedTarget) => expect(obj.target).toEqual('delay0'),
            delay10: (obj: IDelayedTarget) => expect(obj.target).toEqual('delay10'),
        };

        const noDelaySpy = spyOn(callbacks, 'noDelay');
        noDelaySpy.and.callThrough();
        const delay0Spy = spyOn(callbacks, 'delay0');
        delay0Spy.and.callThrough();
        const delay10Spy = spyOn(callbacks, 'delay10');
        delay10Spy.and.callThrough();

        emissions$.pipe(
            take(1),
        ).subscribe(callbacks.noDelay);

        expect(noDelaySpy).toHaveBeenCalled();
        expect(delay0Spy).not.toHaveBeenCalled();
        expect(delay10Spy).not.toHaveBeenCalled();

        emissions$.pipe(
            skip(1),
            take(1),
        ).subscribe(callbacks.delay0);

        tick();

        expect(delay0Spy).toHaveBeenCalled();
        expect(delay10Spy).not.toHaveBeenCalled();

        emissions$.pipe(
            skip(2),
            take(1),
        ).subscribe(callbacks.delay10);

        tick(10);

        expect(delay10Spy).toHaveBeenCalled();
    }));

    [100, 200, 300, 400, 500, 1000, 2000, 3000].forEach((delay) => {
        it(`should emit the value; after ${delay}ms`, fakeAsync(() => {
            const stream$ = asyncOf(new Object(), delay)
                .pipe(
                    startWith(null),
                    shareReplay(1),
                );

            const callbacks = {
                empty: (output: Object | null) => expect(output).toBeNull(),
                response: (output: Object | null) => {
                    expect(output).not.toBeNull();
                    expect(output!.constructor).toBe(Object);
                },
            };

            const emptySpy = spyOn(callbacks, 'empty');
            emptySpy.and.callThrough();
            const responseSpy = spyOn(callbacks, 'response');
            responseSpy.and.callThrough();

            stream$
                .pipe(
                    take(1),
                ).subscribe(callbacks.empty);

            tick(delay);

            expect(emptySpy).toHaveBeenCalled();
            expect(responseSpy).not.toHaveBeenCalled();

            stream$
                .pipe(
                    take(1),
                ).subscribe(callbacks.response);

            tick(1);

            expect(responseSpy).toHaveBeenCalled();
        }));
    });
});

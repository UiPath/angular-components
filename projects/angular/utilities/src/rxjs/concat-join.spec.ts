import {
    fakeAsync,
    tick,
} from '@angular/core/testing';

import { of } from 'rxjs';
import {
    catchError,
    delay,
    finalize,
    timeout,
} from 'rxjs/operators';

import { concatJoin } from './concat-join';

interface IPayload {
    number: number;
}

const FIRST_DELAY = 100;
const SECOND_DELAY = 200;
const THIRD_DELAY = 300;

const FIRST_PAYLOAD: IPayload = { number: 1 };
const SECOND_PAYLOAD: IPayload = { number: 2 };
const THIRD_PAYLOAD: IPayload = { number: 3 };

describe('Util(rxjs): concatJoin', () => {
    describe('Scenario: sync sources', () => {
        it('should emit the sync source aggregate in the provided order', (done) => {
            const first = of(FIRST_PAYLOAD);
            const second = of(SECOND_PAYLOAD);
            const third = of(THIRD_PAYLOAD);

            const aggregate$ = concatJoin(
                first,
                third,
                second,
            );

            const callbacks = {
                success: (response: IPayload[]) => {
                    expect(response.length).toEqual(3);
                    const [f, t, s] = response;

                    expect(f).toBe(FIRST_PAYLOAD);
                    expect(s).toBe(SECOND_PAYLOAD);
                    expect(t).toBe(THIRD_PAYLOAD);
                },
            };

            const successSpy = spyOn(callbacks, 'success');
            successSpy.and.callThrough();

            aggregate$
                .pipe(finalize(done))
                .subscribe(callbacks.success);

            expect(successSpy).toHaveBeenCalled();
            expect(successSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('Scenario: async sources', () => {
        it('should emit the async source aggregate in the provided order', fakeAsync((done: DoneFn) => {
            const first = of(FIRST_PAYLOAD).pipe(delay(100));
            const second = of(SECOND_PAYLOAD).pipe(delay(200));
            const third = of(THIRD_PAYLOAD).pipe(delay(300));

            const aggregate$ = concatJoin(
                first,
                third,
                second,
            );

            const callbacks = {
                success: (response: IPayload[]) => {
                    expect(response.length).toEqual(3);
                    const [f, t, s] = response;

                    expect(f).toBe(FIRST_PAYLOAD);
                    expect(s).toBe(SECOND_PAYLOAD);
                    expect(t).toBe(THIRD_PAYLOAD);
                },
            };

            const successSpy = spyOn(callbacks, 'success');
            successSpy.and.callThrough();

            aggregate$
                .pipe(finalize(done))
                .subscribe(callbacks.success);

            tick(FIRST_DELAY + SECOND_DELAY + THIRD_DELAY);

            expect(successSpy).toHaveBeenCalled();
            expect(successSpy).toHaveBeenCalledTimes(1);
        }));
    });

    describe('Scenario: sync and async sources', () => {
        it('should emit the sync and async aggregate in the provided order', fakeAsync((done: DoneFn) => {
            const first = of(FIRST_PAYLOAD).pipe(delay(FIRST_DELAY));
            const second = of(SECOND_PAYLOAD);
            const third = of(THIRD_PAYLOAD).pipe(delay(THIRD_DELAY));

            const aggregate$ = concatJoin(
                first,
                third,
                second,
            );

            const callbacks = {
                success: (response: IPayload[]) => {
                    expect(response.length).toEqual(3);
                    const [f, t, s] = response;

                    expect(f).toBe(FIRST_PAYLOAD);
                    expect(s).toBe(SECOND_PAYLOAD);
                    expect(t).toBe(THIRD_PAYLOAD);
                },
            };

            const successSpy = spyOn(callbacks, 'success');
            successSpy.and.callThrough();

            aggregate$
                .pipe(finalize(done))
                .subscribe(callbacks.success);

            tick(FIRST_DELAY + THIRD_DELAY);

            expect(successSpy).toHaveBeenCalled();
            expect(successSpy).toHaveBeenCalledTimes(1);
        }));
    });

    describe('Scenario: timeout', () => {
        it('should not emit before the timeout interval if a source takes too long to respond', fakeAsync((done: DoneFn) => {
            const TIMEOUT = 4000;

            const first = of(FIRST_PAYLOAD).pipe(delay(FIRST_DELAY));
            const second = of(SECOND_PAYLOAD);
            const third = of(THIRD_PAYLOAD).pipe(delay(TIMEOUT + THIRD_DELAY));

            const aggregate$ = concatJoin(
                first,
                third,
                second,
            );

            const callbacks = {
                error: (err: Error) => {
                    expect(err).toBeDefined();
                    expect(err.name).toEqual('TimeoutError');
                    return of([]);
                },
                success: (response: IPayload[]) => {
                    expect(response.length).toEqual(0);
                },
            };

            const errorSpy = spyOn(callbacks, 'error');
            errorSpy.and.callThrough();
            const successSpy = spyOn(callbacks, 'success');
            successSpy.and.callThrough();

            aggregate$
                .pipe(
                    timeout(TIMEOUT),
                    catchError(callbacks.error),
                    finalize(done),
                )
                .subscribe(callbacks.success);

            tick(TIMEOUT);

            expect(errorSpy).toHaveBeenCalled();
            expect(errorSpy).toHaveBeenCalledTimes(1);
            expect(successSpy).toHaveBeenCalled();
            expect(successSpy).toHaveBeenCalledTimes(1);
        }));
    });
});

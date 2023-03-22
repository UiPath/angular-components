import humanizeDuration from 'humanize-duration';
import { Duration } from 'luxon';
import {
    BehaviorSubject,
    merge,
    Observable,
    of,
} from 'rxjs';
import {
    distinctUntilChanged,
    map,
} from 'rxjs/operators';

import {
    ChangeDetectionStrategy,
    Component,
    Inject,
    InjectionToken,
    Input,
    Optional,
} from '@angular/core';

/**
 * The date format options schema.
 */
export interface ISecondFormatOptions {
    /**
     * Stream that triggers a re-render of the component.
     *
     */
    redraw$: Observable<void>;
}

/**
 * `ui-secondformat` injection token for the `options`.
 *
 */
export const UI_SECONDFORMAT_OPTIONS = new InjectionToken<Observable<void>>('UiSecondFormat options.');

/**
 * A directive that formats a given number of `seconds` into a human readable format.
 *
 * eg:
 * For input `61` -> output `1 minute` with the tooltip PT1M1S.
 * Depends On:
 * - [luxon](https://www.npmjs.com/package/luxon)
 * - [humanize-duration](https://www.npmjs.com/package/humanize-duration)
 *
 * @export
 */
@Component({
    selector: 'ui-secondformat',
    template: `<span [matTooltip]="(tooltip$ | async) ?? ''">{{ text$ | async }}</span>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class UiSecondFormatDirective {
    /**
     * The number of `seconds` that need to be formatted.
     *
     */
    @Input()
    get seconds() { return this._seconds$.value; }
    set seconds(seconds: number | null) { this._seconds$.next(seconds); }

    /**
     * @internal
     */
    tooltip$: Observable<string | undefined>;

    /**
     * @internal
     */
    text$: Observable<string>;

    protected _text?: HTMLElement;

    private _seconds$ = new BehaviorSubject<number | null>(null);

    /**
     * @ignore
     */
    constructor(
        @Inject(UI_SECONDFORMAT_OPTIONS)
        @Optional()
        options: ISecondFormatOptions,
    ) {
        options = options || {};
        const redraw$ = options.redraw$ || of(null);

        const seconds$ = merge(
            redraw$,
            this._seconds$.pipe(distinctUntilChanged()),
        ).pipe(
            map(() => this.seconds),
            map(this._mapSecondsToDuration),
        );

        this.text$ = seconds$.pipe(
            map(this._mapDurationToText),
        );

        this.tooltip$ = seconds$.pipe(
            map(this._mapDurationToTooltip),
        );
    }

    private _mapSecondsToDuration = (seconds: number | null) => {
        if (seconds == null) {
            return null;
        }

        return Duration.fromObject({ seconds });
    };

    private _mapDurationToText = (duration: Duration | null) => {
        if (duration == null) {
            return '';
        }

        return humanizeDuration(duration.toMillis(), {
                language: duration.locale,
                // Max number of units is set to 1 to mimic what moment does
                largest: 1,
            });
    };

    private _mapDurationToTooltip = (duration: Duration | null) => {
        if (duration == null) {
            return '';
        }

        return duration.shiftTo('hours', 'minutes', 'seconds').toISO();
    };
}

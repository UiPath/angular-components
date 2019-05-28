import {
  Directive,
  ElementRef,
  Inject,
  InjectionToken,
  Input,
  OnChanges,
  OnDestroy,
  Optional,
  Renderer2,
} from '@angular/core';

import * as _moment from 'moment';
import {
  merge,
  Observable,
  of,
  Subject,
} from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  map,
  takeUntil,
} from 'rxjs/operators';

/**
 * Rollup issue: https://github.com/rollup/rollup/issues/670
 * @ignore
 */
const moment = _moment;

/**
 * Moment formatter schema.
 *
 * @ignore
 */
type IMomentFormatter = string | ((num: number, withoutSuffix: boolean, key: string) => string);

/**
 * Moment locale schema.
 *
 * @ignore
 */
interface IMomentRelativeLocale {
    dd: IMomentFormatter;
    d: IMomentFormatter;
    hh: IMomentFormatter;
    h: IMomentFormatter;
    mm: IMomentFormatter;
    m: IMomentFormatter;
    ss: IMomentFormatter;
}

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
 * For input `61` -> output `1 minute 1 seconds`.
 * Depends On:
 * - [moment](https://www.npmjs.com/package/moment)
 * - [moment-timezone](https://www.npmjs.com/package/moment-timezone)
 *
 * In order to reduce bundle sizes, we strongly recommend using the following webpack plugins:
 * - [moment-locales-webpack-plugin](https://www.npmjs.com/package/moment-locales-webpack-plugin)
 * - [moment-timezone-data-webpack-plugin](https://www.npmjs.com/package/moment-timezone-data-webpack-plugin)
 *
 * @export
 */
@Directive({
    selector: '[uiSecondFormat], ui-secondformat',
})
export class UiSecondFormatDirective implements OnChanges, OnDestroy {
    /**
     * The number of `seconds` that need to be formatted.
     *
     */
    @Input() public seconds?: number;

    private _text?: HTMLElement;
    private _destroyed$ = new Subject();
    private _redraw$ = new Subject();

    /**
     * @ignore
     */
    constructor(
        @Inject(UI_SECONDFORMAT_OPTIONS)
        @Optional()
        options: ISecondFormatOptions,
        private _ref: ElementRef,
        private _renderer: Renderer2,
    ) {
        options = options || {};
        const redraw$ = options.redraw$ || of(null);

        merge(
            redraw$,
            this._redraw$,
        )
            .pipe(
                filter(() => this.seconds != null),
                map(() => this._evaluate(this.seconds)),
                distinctUntilChanged(),
                takeUntil(this._destroyed$),
            ).subscribe(label => {
                if (!this._text) {
                    this._text = this._renderer.createText(label);
                    this._renderer.appendChild(this._ref.nativeElement, this._text);
                } else {
                    this._renderer.setValue(this._text, label);
                }
            });
    }

    /**
     * @ignore
     */
    ngOnChanges() {
        this._redraw$.next();
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        if (this._text) {
            this._renderer.removeChild(this._ref.nativeElement, this._text);
        }
        this._destroyed$.next();
    }

    private _evaluate(value: number = 0) {
        const days = Math.floor(value / 60 / 60 / 24);
        const hours = Math.floor(value / 60 / 60 % 24);
        const minutes = Math.floor(value / 60 % 60);
        const seconds = Math.floor(value % 60);
        const remainder = value - Math.floor(value);

        return this._format(days, hours, minutes, seconds, remainder);
    }

    private _format(days: number, hours: number, minutes: number, seconds: number, remainder: number) {
        const locale = (moment.localeData() as any)['_relativeTime'] as IMomentRelativeLocale;

        const daysLabel = !!days ? this._dayFormat(locale, days) : '';
        const hoursLabel = !!hours ? this._hourFormat(locale, hours) : '';
        const minutesLabel = !!minutes ? this._minuteFormat(locale, minutes) : '';
        const secondsLabel =
            !hoursLabel && !minutesLabel && !daysLabel ||
                seconds > 0 ?
                this._secondFormat(locale, seconds, remainder) : '';

        return `${daysLabel} ${hoursLabel} ${minutesLabel} ${secondsLabel}`.trim();
    }

    private _dayFormat = (locale: IMomentRelativeLocale, days: number) => {
        const formatter = days === 1 ? locale.d : locale.dd;

        if (typeof formatter === 'string') {
            return formatter.replace('%d', days.toString());
        }

        return formatter(days, true, 'dd');
    }

    private _hourFormat = (locale: IMomentRelativeLocale, hours: number) => {
        const formatter = hours === 1 ? locale.h : locale.hh;

        if (typeof formatter === 'string') {
            return formatter.replace('%d', hours.toString());
        }

        return formatter(hours, true, 'hh');
    }

    private _minuteFormat = (locale: IMomentRelativeLocale, minutes: number) => {
        const formatter = minutes === 1 ? locale.m : locale.mm;

        if (typeof formatter === 'string') {
            return formatter.replace('%d', minutes.toString());
        }

        return formatter(minutes, true, 'mm');
    }

    private _secondFormat = (locale: IMomentRelativeLocale, seconds: number, remainder: number) =>
        typeof locale.ss === 'string' ?
            locale.ss.replace('%d', (seconds + remainder).toFixed(remainder ? 2 : 0)) :
            locale.ss(seconds + remainder, true, 'ss')
                .replace((seconds + remainder)
                    .toString(),
                    (seconds + remainder).toFixed(remainder ? 2 : 0),
                )
}

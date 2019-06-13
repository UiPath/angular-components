import {
  Directive,
  ElementRef,
  Inject,
  InjectionToken,
  Input,
  Optional,
  Renderer2,
} from '@angular/core';
import { UiFormat } from '@uipath/angular/directives/internal';

import * as _moment from 'moment';
import {
  merge,
  Observable,
  of,
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
export class UiSecondFormatDirective extends UiFormat {
    /**
     * The number of `seconds` that need to be formatted.
     *
     */
    @Input() public seconds?: number;

    protected _text?: HTMLElement;

    /**
     * @ignore
     */
    constructor(
        @Inject(UI_SECONDFORMAT_OPTIONS)
        @Optional()
            options: ISecondFormatOptions,
            renderer: Renderer2,
            elementRef: ElementRef,
    ) {
        super(
            renderer,
            elementRef,
        );

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
                    this._renderer.appendChild(this._elementRef.nativeElement, this._text);
                } else {
                    this._renderer.setValue(this._text, label);
                }
            });
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


    private _formatFactory = (
        formatSingular: keyof IMomentRelativeLocale,
        formatPlural: keyof IMomentRelativeLocale,
    ) =>
        (locale: IMomentRelativeLocale, value: number) => {
            const formatter = value === 1 ? locale[formatSingular] : locale[formatPlural];

            if (typeof formatter === 'string') {
                return formatter.replace('%d', value.toString());
            }

            return formatter(value, true, formatPlural);
        }

    // tslint:disable-next-line: member-ordering
    private _dayFormat = this._formatFactory('d', 'dd');
    // tslint:disable-next-line: member-ordering
    private _hourFormat = this._formatFactory('h', 'hh');
    // tslint:disable-next-line: member-ordering
    private _minuteFormat = this._formatFactory('m', 'mm');

    private _secondFormat = (locale: IMomentRelativeLocale, seconds: number, remainder: number) =>
        typeof locale.ss === 'string' ?
            locale.ss.replace('%d', (seconds + remainder).toFixed(remainder ? 2 : 0)) :
            locale.ss(seconds + remainder, true, 'ss')
                .replace((seconds + remainder)
                    .toString(),
                (seconds + remainder).toFixed(remainder ? 2 : 0),
                )
}

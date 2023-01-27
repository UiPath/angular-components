import 'moment-timezone';

import {
 DateTime,
 DateTimeFormatOptions,
} from 'luxon';
import moment from 'moment';
import {
    interval,
    merge,
    Observable,
    of,
} from 'rxjs';
import {
    delay,
    filter,
    take,
    takeUntil,
} from 'rxjs/operators';

import {
    ChangeDetectorRef,
    Directive,
    ElementRef,
    Inject,
    InjectionToken,
    Input,
    NgZone,
    Optional,
    Renderer2,
} from '@angular/core';
import { UiFormatDirective } from '@uipath/angular/directives/internal';
import { USE_LUXON } from '@uipath/angular/utilities';

/**
 * The date format display type options.
 */
export type DisplayType = 'absolute' | 'relative';

/**
 * Timezone resolver type.
 */
export type TimezoneResolver = () => string;

/**
 * The date format options schema.
 */
export interface IDateFormatOptions {
    /**
     * Stream that triggers a re-render of the component.
     *
     */
    redraw$: Observable<void>;
    /**
     * The timezone in which the date should be displayed.
     *
     */
    timezone: string | TimezoneResolver;
    /**
     * Overwrites the default content type.
     *
     */
    contentType?: DisplayType;
    /**
     * Overwrites the default title type.
     *
     */
    titleType?: DisplayType;
    /**
     * Overwrites the default dateformat used by moment.js.
     * When supplied Luxon formatting options, Luxon will be used instead of moment.js.
     *
     */
    format?: string | DateTimeFormatOptions;
}

/**
 * `ui-dateformat` injection token for the `options`.
 *
 */
export const UI_DATEFORMAT_OPTIONS = new InjectionToken<IDateFormatOptions>('UiDateFormat options.');

/**
 * @ignore
 */
const RELATIVE_TIME_UPDATE_INTERVAL = 10000;

export const resolveTimezone = (options: IDateFormatOptions) => {
    const type = typeof options.timezone;

    switch (type) {
        case 'string':
            return (options.timezone as string);
        case 'function':
            return (options.timezone as TimezoneResolver)();
        default:
            return '';
    }
};

/**
 * A directive that formats a given `Date` input in a `relative` or `absolute` format.
 *
 * Depends On:
 * - [moment](https://www.npmjs.com/package/moment)
 * - [moment-timezone](https://www.npmjs.com/package/moment-timezone)
 *
 * In order to reduce bundle sizes, we strongly recommend using the following webpack plugins:
 * - [moment-locales-webpack-plugin](https://www.npmjs.com/package/moment-locales-webpack-plugin)
 * - [moment-timezone-data-webpack-plugin](https://www.npmjs.com/package/moment-timezone-data-webpack-plugin)
 *
 * Optionally, you can opt-in to use Luxon instead of Moment.
 * Depends On:
 * - [luxon](https://www.npmjs.com/package/luxon)
 * - [humanize-duration](https://www.npmjs.com/package/humanize-duration)
 *
 * @export
 */
@Directive({
    selector: '[uiDateFormat], ui-dateformat',
})
export class UiDateFormatDirective extends UiFormatDirective {
    /**
     * What format should the content have, `absolute` or `relative`.
     *
     */
    @Input()
    contentType!: DisplayType;
    /**
     * What format should the `[data-title]` attribute have, `absolute` or `relative`.
     *
     * This title attribute is exposed in order to easily integrate with `tooltip` components.
     *
     * eg:
     * `<ui-dateformat #ref [matTooltip]="ref.dataset['title']"></ui-dateformat>`
     */
    @Input()
    titleType!: DisplayType;
    /**
     * The `timezone` for which the current date is displayed.
     *
     */
    @Input()
    timezone?: string;
    /**
     * The input `Date` that needs to be formatted.
     *
     */
    @Input()
    set date(date: Date | string | undefined | null) {
        date = date ?? undefined;

        if (this._isDifferentValue(date, this._date)) {
            const initial = this._date === undefined;
            this._date = date;

            if (initial) {
                this._zone.runOutsideAngular(() => {
                    merge(
                        this._zone.onMicrotaskEmpty,
                        // IE doesn't play nicely with task empty only
                        this._zone.onStable,
                    )
                        .pipe(
                            take(1),
                            // hack needed for initial render of mat-tooltip
                            // if not done only on initial may create a change detection loop
                            // seen on Edge ~107, cannot point to the exact root cause why
                            delay(0),
                        )
                        .subscribe(() => {
                            this._cd.markForCheck();
                        });
                });
            }
        }
    }
    get date() {
        return this._date;
    }
    /**
     * The 'moment' format defaults to 'L LTS'.
     * The `luxon` format defaults to `DateTime.DATETIME_SHORT.
     *
     */
    @Input()
    dateFormat!: string | DateTimeFormatOptions;

    protected _text?: HTMLElement;

    private get _relativeTime() {
        if (!this.date) { return ''; }
        if (!(this.date instanceof Date)) { return this.date; }

        const relativeTime = this._isMomentFormat(this.dateFormat)
            ? moment(this.date)
                .fromNow()
            : DateTime.fromJSDate(this.date)
                .toRelative();

        return relativeTime ?? '';
    }

    private get _absoluteTime() {
        if (!this.date) { return ''; }
        if (!(this.date instanceof Date)) { return this.date; }

        const absoluteTime = this._isMomentFormat(this.dateFormat)
            ? moment(this.date)
                .tz(this.timezone ?? resolveTimezone(this._options))
                .format(this.dateFormat)
            : DateTime
                .fromJSDate(this.date, {
                    zone: this.timezone ?? resolveTimezone(this._options),
                })
                .toLocaleString(this.dateFormat);

        return absoluteTime ?? '';
    }

    private _lastAbsoluteTime?: string;
    private _lastRelativeTime?: string;
    private _lastContentType?: DisplayType;
    private _lastTitleType?: DisplayType;
    private _date?: Date | string;

    /**
     * @ignore
     */
    constructor(
        @Inject(UI_DATEFORMAT_OPTIONS)
        @Optional()
        private _options: IDateFormatOptions,
        private _cd: ChangeDetectorRef,
        private _zone: NgZone,
        renderer: Renderer2,
        elementRef: ElementRef,
        @Inject(USE_LUXON)
        @Optional()
        private _useLuxon?: boolean,
    ) {
        super(
            renderer,
            elementRef,
        );

        const defaultFormat = this._useLuxon ? DateTime.DATETIME_SHORT : 'L LTS';

        this._options = _options || {};
        this.dateFormat = this._options.format ?? defaultFormat;
        this.contentType = this._options.contentType ?? 'absolute';
        this.titleType = this._options.titleType ?? 'absolute';

        const redraw$ = this._options.redraw$ || of(null);

        merge(
            redraw$,
            this._redraw$,
            interval(RELATIVE_TIME_UPDATE_INTERVAL).pipe(
                filter(() =>
                    this._isRelative(this.titleType) ||
                    this._isRelative(this.contentType),
                ),
            ),
        )
            .pipe(
                takeUntil(this._destroyed$),
            )
            .subscribe(() => this._evaluate());
    }

    private _evaluate() {
        this._updateTitle();
        this._updateContent();

        this._lastAbsoluteTime = this._absoluteTime;
        this._lastRelativeTime = this._relativeTime;
        this._lastContentType = this.contentType;
        this._lastTitleType = this.titleType;
    }

    private _updateContent() {
        if (
            this._lastContentType === this.contentType &&
            !this._timeForTypeChanged(this.contentType)
        ) { return; }

        const text = ` ${this._timeForType(this.contentType)} `;

        if (!this._text) {
            this._text = this._renderer.createText(text);
            this._renderer.appendChild(this._elementRef.nativeElement, this._text);
        } else {
            this._renderer.setValue(this._text, text);
        }
    }

    private _updateTitle() {
        if (
            this._lastTitleType === this.titleType &&
            !this._timeForTypeChanged(this.titleType)
        ) { return; }

        this._renderer.setAttribute(this._elementRef.nativeElement, 'data-title', this._timeForType(this.titleType));
    }

    private _isMomentFormat(format: string | DateTimeFormatOptions): format is string {
        return typeof format === 'string';
    }

    private _isRelative = (type: DisplayType) => type === 'relative';

    private _timeForTypeChanged = (type: DisplayType) =>
        this._isRelative(type) ?
            this._lastRelativeTime !== this._relativeTime :
            this._lastAbsoluteTime !== this._absoluteTime;

    private _timeForType = (type: DisplayType) => this._isRelative(type) ?
        this._relativeTime :
        this._absoluteTime;

    private _isDifferentValue = (value: Date | string | undefined, compareValue: Date | string | undefined) => {
        if (value instanceof Date && compareValue instanceof Date) {
            return value.getTime() !== compareValue.getTime();
        }

        return value !== compareValue;
    };
}

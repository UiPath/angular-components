import 'moment-timezone';

import {
    Directive,
    ElementRef,
    Inject,
    InjectionToken,
    Input,
    Optional,
    Renderer2,
} from '@angular/core';
import { UiFormatDirective } from '@uipath/angular/directives/internal';

import * as _moment from 'moment';
import {
    interval,
    merge,
    Observable,
    of,
} from 'rxjs';
import {
    filter,
    takeUntil,
} from 'rxjs/operators';

/**
 * Rollup issue: https://github.com/rollup/rollup/issues/670
 * @ignore
 */
const moment = _moment;

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
    public contentType: DisplayType = 'absolute';
    /**
     * What format should the `[data-title]` attribute have, `absolute` or `relative`.
     *
     * This title attribute is exposed in order to easily integrate with `tooltip` components.
     *
     * eg:
     * `<ui-dateformat #ref [matTooltip]="ref.dataset['title']"></ui-dateformat>`
     */
    @Input()
    public titleType: DisplayType = 'absolute';
    /**
     * The `timezone` for which the current date is displayed.
     *
     */
    @Input()
    public timezone?: string;
    /**
     * The input `Date` that needs to be formatted.
     *
     */
    @Input()
    public date?: Date | string;
    /**
     * The `moment` format, defaults to `L LTS`.
     *
     */
    @Input()
    public dateFormat = 'L LTS';

    protected _text?: HTMLElement;

    private get _relativeTime() {
        if (!this.date) { return ''; }
        if (!(this.date instanceof Date)) { return this.date; }

        return moment(this.date)
            .fromNow();
    }

    private get _absoluteTime() {
        if (!this.date) { return ''; }
        if (!(this.date instanceof Date)) { return this.date; }

        return moment(this.date)
            .tz(this.timezone || resolveTimezone(this._options))
            .format(this.dateFormat);
    }

    private _lastAbsoluteTime?: string;
    private _lastRelativeTime?: string;
    private _lastContentType?: DisplayType;
    private _lastTitleType?: DisplayType;

    /**
     * @ignore
     */
    constructor(
        @Inject(UI_DATEFORMAT_OPTIONS)
        @Optional()
        private _options: IDateFormatOptions,
        renderer: Renderer2,
        elementRef: ElementRef,
    ) {
        super(
            renderer,
            elementRef,
        );

        _options = _options || {};

        const redraw$ = _options.redraw$ || of(null);

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

    private _isRelative = (type: DisplayType) => type === 'relative';

    private _timeForTypeChanged = (type: DisplayType) =>
        this._isRelative(type) ?
            this._lastRelativeTime !== this._relativeTime :
            this._lastAbsoluteTime !== this._absoluteTime

    private _timeForType = (type: DisplayType) => this._isRelative(type) ?
        this._relativeTime :
        this._absoluteTime
}

import 'moment-timezone';

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
  interval,
  merge,
  Observable,
  of,
  Subject,
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
    timezone: string;
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
export class UiDateFormatDirective implements OnChanges, OnDestroy {
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
    public timezone: string;
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
            .tz(this.timezone)
            .format(this.dateFormat);
    }

    private _text?: HTMLElement;
    private _lastAbsoluteTime?: string;
    private _lastRelativeTime?: string;
    private _lastContentType?: DisplayType;
    private _lastTitleType?: DisplayType;
    private _redraw$ = new Subject();
    private _destroyed$ = new Subject();

    /**
     * @ignore
     */
    constructor(
        @Inject(UI_DATEFORMAT_OPTIONS)
        @Optional()
        options: IDateFormatOptions,
        private _renderer: Renderer2,
        private _elementRef: ElementRef,
    ) {
        options = options || {};

        this.timezone = options.timezone;
        const redraw$ = options.redraw$ || of(null);

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
            this._renderer.removeChild(this._elementRef.nativeElement, this._text);
        }
        this._destroyed$.next();
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

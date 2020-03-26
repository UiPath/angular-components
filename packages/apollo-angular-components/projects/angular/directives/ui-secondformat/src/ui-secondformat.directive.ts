import {
    ChangeDetectionStrategy,
    Component,
    Inject,
    InjectionToken,
    Input,
    Optional,
} from '@angular/core';

import * as _moment from 'moment';
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

/**
 * Rollup issue: https://github.com/rollup/rollup/issues/670
 * @ignore
 */
const moment = _moment;

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
 * - [moment](https://www.npmjs.com/package/moment)
 * - [moment-timezone](https://www.npmjs.com/package/moment-timezone)
 *
 * In order to reduce bundle sizes, we strongly recommend using the following webpack plugins:
 * - [moment-locales-webpack-plugin](https://www.npmjs.com/package/moment-locales-webpack-plugin)
 * - [moment-timezone-data-webpack-plugin](https://www.npmjs.com/package/moment-timezone-data-webpack-plugin)
 *
 * @export
 */
@Component({
    selector: 'ui-secondformat',
    template: `<span [matTooltip]="tooltip$ | async">{{ text$ | async }}</span>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
// tslint:disable-next-line: component-class-suffix
export class UiSecondFormatDirective {
    /**
     * The number of `seconds` that need to be formatted.
     *
     */
    @Input()
    public get seconds() { return this._seconds$.value; }
    public set seconds(seconds: number | null) { this._seconds$.next(seconds); }

    /**
     * @internal
     */
    public tooltip$: Observable<string | undefined>;

    /**
     * @internal
     */
    public text$: Observable<string>;

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
            map(seconds => seconds != null ? moment.duration(seconds, 'seconds') : undefined),
        );

        this.text$ = seconds$.pipe(
            map(seconds => seconds?.humanize() ?? ''),
        );

        this.tooltip$ = seconds$.pipe(
            map(seconds => seconds?.toISOString()),
        );
    }
}

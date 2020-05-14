import {
    ChangeDetectionStrategy,
    Component,
    Inject,
    Injectable,
    InjectionToken,
    Optional,
    TemplateRef,
    ViewEncapsulation,
} from '@angular/core';
import {
    MAT_SNACK_BAR_DATA,
    MAT_SNACK_BAR_DEFAULT_OPTIONS,
    MatSnackBar,
    MatSnackBarConfig,
    MatSnackBarRef,
} from '@angular/material/snack-bar';

import { Observable } from 'rxjs';

import { UiSnackbarIntl } from './ui-snackbar.intl';

interface ISnackBarAlert {
    /**
     * Alert message
     */
    message: string | TemplateRef<any>;
    /**
    * How long to remain on the screen
    */
    duration: number;
    /**
     * Material icon to be used in snackbar
     */
    icon?: string;
    /**
     * Aria label for screen-readers on close button
     */
    closeAriaLabel?: string;
}

@Component({
    templateUrl: './ui-snackbar.component.html',
    styleUrls: [
        './ui-snackbar.component.scss',
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiSnackBarComponent {
    /**
     * @internal
     * @ignore
     */
    public isPropertyString(property: string | TemplateRef<any>): property is string {
        return typeof property === 'string';
    }

    constructor(
        @Inject(MAT_SNACK_BAR_DATA)
        public data: ISnackBarAlert,
        public snackBarRef: MatSnackBarRef<UiSnackBarComponent>,
    ) { }
}

export enum SnackBarType {
    Info = 'info',
    Error = 'error',
    Warning = 'warning',
    Success = 'success',
    None = 'none',
}

export const ICON_MAP: Map<SnackBarType, string> = new Map([
    [SnackBarType.Info, 'message'],
    [SnackBarType.Success, 'check_circle'],
    [SnackBarType.Warning, 'warning'],
    [SnackBarType.Error, 'info'],
]);

export type SnackbarAction = (message: string | TemplateRef<any>, duration?: number) => Observable<void>;

export class UiMatSnackBarConfig {
    public restrictHtml = false;
}
export const UI_MAT_SNACK_BAR_DEFAULT_OPTIONS = new InjectionToken<UiMatSnackBarConfig>('UiMatSnackBarConfig');

/**
 * Snackbar config options
 */
interface ISnackBarOptions extends Partial<Exclude<ISnackBarAlert, 'closeAriaLabel' | 'message'>> {
    /**
     * The type of the alert (info, success, warning or error)
     */
    type?: SnackBarType;
}

export const panelClass = (type: SnackBarType) =>
    `ui-snackbar-${type}`;

@Injectable({
    providedIn: 'root',
})
export class UiSnackBarService {
    private _ref?: MatSnackBarRef<UiSnackBarComponent>;

    /**
     * Display an info snackbar
     * @param message The message to be displayed
     * @param duration How long to remain on the screen
    */
    public info: SnackbarAction;
    /**
     * Display an error snackbar
     * @param message The message to be displayed
     * @param duration How long to remain on the screen
    */
    public error: SnackbarAction;
    /**
     * Display an success snackbar
     * @param message The message to be displayed
     * @param duration How long to remain on the screen
    */
    public success: SnackbarAction;
    /**
     * Display an warning snackbar
     * @param message The message to be displayed
     * @param duration How long to remain on the screen
    */
    public warning: SnackbarAction;

    constructor(
        private _snackBar: MatSnackBar,
        @Inject(MAT_SNACK_BAR_DEFAULT_OPTIONS)
        private _options: MatSnackBarConfig,
        @Optional()
        private readonly _snackIntl: UiSnackbarIntl,
        @Inject(UI_MAT_SNACK_BAR_DEFAULT_OPTIONS)
        @Optional()
        private _additionalOptions?: UiMatSnackBarConfig,
    ) {
        this._snackIntl = this._snackIntl ||
            new UiSnackbarIntl();

        this.info = this._alertFactory(SnackBarType.Info);
        this.error = this._alertFactory(SnackBarType.Error);
        this.success = this._alertFactory(SnackBarType.Success);
        this.warning = this._alertFactory(SnackBarType.Warning);
    }

    /**
     * Display a snackbar (customizable)
     * @param message The message to be displayed
     * @param options Customize default options: snackbar type, icon, display duration
     */
    public show = (message: string, { type, duration, icon }
        : ISnackBarOptions = {}) =>
        this._alert(type || SnackBarType.None, {
            message,
            icon: icon || ICON_MAP.get(type!),
            duration: duration || duration === 0 ? duration : this._options.duration!,
        })

    /**
     * Dismiss the displayed snackbar
     */
    public clear() {
        if (!this._ref) { return; }

        this._ref.dismiss();
    }

    private _alertFactory = (type: SnackBarType) =>
        (message: string | TemplateRef<any>, duration?: number) => this._alert(type, {
            message,
            icon: ICON_MAP.get(type),
            duration: duration || duration === 0 ? duration : this._options.duration!,
        })

    private _alert(type: SnackBarType, options: ISnackBarAlert) {
        if (
            this._additionalOptions?.restrictHtml &&
            typeof options.message === 'string'
        ) {
            const span = document.createElement('span');
            span.innerText = options.message;
            options.message = span.innerHTML;
            span.remove();
        }

        this._ref = this._snackBar.openFromComponent(UiSnackBarComponent, {
            data: {
                closeAriaLabel: this._snackIntl.closeAriaLabel,
                ...options,
            },
            duration: options.duration,
            panelClass: panelClass(type),
        });

        return this._ref.afterOpened();
    }
}

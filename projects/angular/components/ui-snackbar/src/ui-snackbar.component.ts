import {
    ComponentPortal,
    ComponentType,
} from '@angular/cdk/portal';
import {
    ChangeDetectionStrategy,
    Component,
    Inject,
    Injectable,
    InjectionToken,
    Injector,
    Optional,
    TemplateRef,
    ViewEncapsulation,
} from '@angular/core';
import {
    MatSnackBar,
    MatSnackBarConfig,
    MatSnackBarRef,
    MAT_SNACK_BAR_DATA,
    MAT_SNACK_BAR_DEFAULT_OPTIONS,
} from '@angular/material/snack-bar';

import { UiSnackbarIntl } from './ui-snackbar.intl';

interface ISnackBarAlert {
    /**
     * Alert message
     */
    message: string | TemplateRef<any> | ComponentType<unknown>;
    /**
     * Optional action button message,
     * will emit `dismissWithAction` on click
     */
    actionMessage?: string;
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
    /**
     * Additional information to pass to components. Can be used by injecting `UI_MAT_SNACK_BAR_PAYLOAD`.
     */
    payload?: unknown;
    /**
     *  Extra CSS classes to be added to the snack bar container.
     */
    extraCssClasses?: string[];
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
    private _componentPortal?: ComponentPortal<unknown>;

    get componentPortal() {
        if (typeof this.data.message !== 'function') {
            throw new Error('`componentPortal` getter cannot be used when `data.message` is not a component type');
        }

        this._componentPortal ??= new ComponentPortal(
            this.data.message,
            null,
            Injector.create({
                providers: [
                    {
                        provide: UI_MAT_SNACK_BAR_PAYLOAD,
                        useValue: this.data.payload,
                    },
                ],
                parent: this._injector,

            }),
        );

        return this._componentPortal;
    }

    constructor(
        @Inject(MAT_SNACK_BAR_DATA)
        public data: ISnackBarAlert,
        public snackBarRef: MatSnackBarRef<UiSnackBarComponent>,
        private _injector: Injector,
    ) { }

    /**
     * @internal
     * @ignore
     */
    isPropertyString(property: unknown): property is string {
        return typeof property === 'string';
    }

    /**
     * @internal
     * @ignore
     */
    isTemplateRef(property: unknown): property is TemplateRef<unknown> {
        return property instanceof TemplateRef;
    }

    /**
     * @internal
     * @ignore
     */
    isComponentType(property: unknown): property is ComponentType<unknown> {
        return typeof property === 'function';
    }
}

export enum SnackBarType {
    Info = 'info',
    Error = 'error',
    Warning = 'warning',
    Success = 'success',
    None = 'none',
}

export const ICON_MAP: Map<SnackBarType, string> = new Map([
    [SnackBarType.Info, 'info'],
    [SnackBarType.Success, 'check_circle'],
    [SnackBarType.Warning, 'warning'],
    [SnackBarType.Error, 'error'],
]);
export type SnackbarAction = (
    message: string | TemplateRef<any> | ComponentType<unknown>,
    config?: {
        actionMessage?: string;
        duration?: number;
        payload?: unknown;
        extraCssClasses?: string[];
    },
) => MatSnackBarRef<UiSnackBarComponent>;

export class UiMatSnackBarConfig {
    restrictHtml = false;
}

export const UI_MAT_SNACK_BAR_DEFAULT_OPTIONS = new InjectionToken<UiMatSnackBarConfig>('UiMatSnackBarConfig');
export const UI_MAT_SNACK_BAR_PAYLOAD = new InjectionToken('UiSnackBarService Payload');

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

    /**
     * Display an info snackbar
     *
     * @param message The message to be displayed
     * @param config  `{ actionMessage, duration }`
     */
    info: SnackbarAction;
    /**
     * Display an error snackbar
     *
     * @param message The message to be displayed
     * @param config  `{ actionMessage, duration }`
     */
    error: SnackbarAction;
    /**
     * Display an success snackbar
     *
     * @param message The message to be displayed
     * @param config  `{ actionMessage, duration }`
     */
    success: SnackbarAction;
    /**
     * Display an warning snackbar
     *
     * @param message The message to be displayed
     * @param config  `{ actionMessage, duration }`
     */
    warning: SnackbarAction;
    private _ref?: MatSnackBarRef<UiSnackBarComponent>;

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
     *
     * @param message The message to be displayed
     * @param options Customize default options: snackbar type, icon, display duration, and action message
     */
    show = (
        message: string | TemplateRef<any> | ComponentType<unknown>,
        { type, duration, icon, actionMessage, payload, extraCssClasses }: ISnackBarOptions = {},
    ) =>
        this._alert(type ?? SnackBarType.None, {
            message,
            icon: icon ?? ICON_MAP.get(type!),
            duration: duration || duration === 0 ? duration : this._options.duration!,
            actionMessage,
            payload,
            extraCssClasses,
        });

    /**
     * Dismiss the displayed snackbar
     */
    clear() {
        if (!this._ref) { return; }

        this._ref.dismiss();
    }

    private _alertFactory = (type: SnackBarType) =>
        (
            message: string | TemplateRef<any> | ComponentType<unknown>,
            config?: { actionMessage?: string; duration?: number; payload?: unknown; extraCssClasses?: string[] }) =>
            this._alert(type, {
                message,
                actionMessage: config?.actionMessage,
                icon: ICON_MAP.get(type),
                duration: config?.duration || config?.duration === 0
                    ? config.duration
                    : this._options.duration!,
                payload: config?.payload,
                extraCssClasses: config?.extraCssClasses,
            });

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

        const extraPanelClasses = options.extraCssClasses ?? [];
        this._ref = this._snackBar.openFromComponent(UiSnackBarComponent, {
            data: {
                closeAriaLabel: this._snackIntl.closeSnackbarShortcut,
                ...options,
            },
            duration: options.duration,
            panelClass: [panelClass(type), ...extraPanelClasses],
        });

        return this._ref;
    }
}

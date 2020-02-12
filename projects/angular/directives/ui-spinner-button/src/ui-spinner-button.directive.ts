
import {
    ComponentFactoryResolver,
    Directive,
    Input,
    OnInit,
    Renderer2,
    ViewContainerRef,
} from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { UiLoaderButtonDirective } from '@uipath/angular/directives/internal';

import { UiButtonProgressSpinnerComponent } from './internal/ui-button-progress-spinner.component';

export const enum SpinnerButtonClass {
    Base = 'ui-spinner-button',
    Loading = 'ui-spinner-button-loading',
}

@Directive({
    selector: `
        button[mat-icon-button][ui-spinner-button],
        button[mat-fab][ui-spinner-button],
        button[mat-mini-fab][ui-spinner-button],
        button[mat-icon-button][uiSpinnerButton],
        button[mat-raised-button][ui-spinner-button],
        button[mat-stroked-button][ui-spinner-button],
        button[mat-flat-button][ui-spinner-button],
        button[mat-button][uiSpinnerButton],
        button[mat-raised-button][uiSpinnerButton],
        button[mat-stroked-button][uiSpinnerButton],
        button[mat-flat-button][uiSpinnerButton],
        button[mat-fab][uiSpinnerButton],
        button[mat-mini-fab][uiSpinnerButton],
        button[mat-button][ui-spinner-button],
    `,
    exportAs: 'uiSpinnerButton',
})
export class UiSpinnerButtonDirective
    extends UiLoaderButtonDirective<UiButtonProgressSpinnerComponent>
    implements OnInit {
    @Input()
    public spinnerButtonLoading = false;

    @Input()
    public spinnerButtonMode: MatProgressSpinner['mode'] = 'indeterminate';

    @Input()
    public spinnerButtonValue: MatProgressSpinner['value'] = 0;

    @Input()
    public spinnerButtonColor: MatProgressSpinner['color'] = 'accent';

    constructor(
        button: MatButton,
        componentFactory: ComponentFactoryResolver,
        container: ViewContainerRef,
        private _renderer: Renderer2,
    ) {
        super(
            UiButtonProgressSpinnerComponent,
            componentFactory,
            container,
        );

        const isRound = button.isIconButton ||
            button.isRoundButton;

        this._loader.isRound$.next(isRound);

        this._registerWatcher('spinnerButtonLoading', this._applyLoading);
        this._registerWatcher('spinnerButtonMode', this._applyMode);
        this._registerWatcher('spinnerButtonValue', this._applyValue);
        this._registerWatcher('spinnerButtonColor', this._applyColor);
    }

    ngOnInit() {
        this._initialize();

        this._renderer.addClass(this._buttonElement, SpinnerButtonClass.Base);

        this._renderer.appendChild(
            this._buttonElement,
            this._loaderElement,
        );
    }

    private _applyColor = () => {
        this._loader.color$.next(this.spinnerButtonColor);
    }

    private _applyValue = () => {
        this._loader.value$.next(this.spinnerButtonValue);
    }

    private _applyMode = () => {
        this._loader.mode$.next(this.spinnerButtonMode);
    }

    private _applyLoading = () => {
        if (this.spinnerButtonLoading) {
            this._renderer.addClass(this._buttonElement, SpinnerButtonClass.Loading);
        } else {
            this._renderer.removeClass(this._buttonElement, SpinnerButtonClass.Loading);
        }

        this._loader.loading$.next(this.spinnerButtonLoading);
    }
}

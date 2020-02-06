import {
    ComponentFactoryResolver,
    Directive,
    Input,
    OnInit,
    Renderer2,
    ViewContainerRef,
} from '@angular/core';
import { MatProgressBar } from '@angular/material/progress-bar';
import { UiLoaderButtonDirective } from '@uipath/angular/directives/internal';

import { UiButtonProgressBarComponent } from './internal/ui-button-progress-bar.component';

export const enum ButtonProgressClass {
    Base = 'ui-button-progress',
}

@Directive({
    selector: `
        button[mat-button][ui-progress-button],
        button[mat-raised-button][ui-progress-button],
        button[mat-stroked-button][ui-progress-button],
        button[mat-flat-button][ui-progress-button],
        button[mat-button][uiProgressButton],
        button[mat-raised-button][uiProgressButton],
        button[mat-stroked-button][uiProgressButton],
        button[mat-flat-button][uiProgressButton],
    `,
    exportAs: 'uiProgressButton',
})
export class UiProgressButtonDirective
    extends UiLoaderButtonDirective<UiButtonProgressBarComponent>
    implements OnInit {

    @Input()
    public progressButtonLoading = false;

    @Input()
    public progressButtonMode: MatProgressBar['mode'] = 'indeterminate';

    @Input()
    public progressButtonValue: MatProgressBar['value'] = 0;

    @Input()
    public progressButtonBufferValue: MatProgressBar['bufferValue'] = 0;

    @Input()
    public progressButtonColor: MatProgressBar['color'] = 'accent';

    constructor(
        componentFactory: ComponentFactoryResolver,
        container: ViewContainerRef,
        private _renderer: Renderer2,
    ) {
        super(
            UiButtonProgressBarComponent,
            componentFactory,
            container,
        );

        this._registerWatcher('progressButtonLoading', this._applyLoading);
        this._registerWatcher('progressButtonMode', this._applyMode);
        this._registerWatcher('progressButtonValue', this._applyValue);
        this._registerWatcher('progressButtonBufferValue', this._applyBufferValue);
        this._registerWatcher('progressButtonColor', this._applyColor);
    }

    ngOnInit() {
        this._initialize();

        this._renderer.addClass(this._buttonElement, ButtonProgressClass.Base);

        this._renderer.appendChild(
            this._buttonElement,
            this._loaderElement,
        );
    }

    private _applyColor = () => {
        this._loader.color$.next(this.progressButtonColor);
    }

    private _applyValue = () => {
        this._loader.value$.next(this.progressButtonValue);
    }

    private _applyBufferValue = () => {
        this._loader.bufferValue$.next(this.progressButtonBufferValue);
    }

    private _applyMode = () => {
        this._loader.mode$.next(this.progressButtonMode);
    }

    private _applyLoading = () => {
        this._loader.loading$.next(this.progressButtonLoading);
    }
}

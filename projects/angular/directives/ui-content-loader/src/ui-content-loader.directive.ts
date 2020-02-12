import {
    ComponentFactoryResolver,
    ComponentRef,
    Directive,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewContainerRef,
} from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

import {
    BehaviorSubject,
    Subject,
} from 'rxjs';
import {
    distinctUntilChanged,
    filter,
} from 'rxjs/operators';

import { UiContentSpinnerComponent } from './internal/ui-content-spinner.component';

@Directive({
    selector: '[uiContentLoading]',
})
export class UiContentLoaderDirective implements OnInit, OnChanges, OnDestroy {
    @Input()
    public set uiContentLoading(value: boolean) {
        this._loading$.next(value);
    }

    @Input()
    public uiContentLoadingMode?: MatProgressSpinner['mode'];

    @Input()
    public uiContentLoadingDiameter?: MatProgressSpinner['diameter'];

    @Input()
    public uiContentLoadingValue?: MatProgressSpinner['value'];

    @Input()
    public uiContentLoadingColor?: MatProgressSpinner['color'];

    private _spinner?: ComponentRef<UiContentSpinnerComponent>;
    private _loading$ = new BehaviorSubject<boolean>(false);
    private _change$ = new Subject<void>();

    constructor(
        private _resolver: ComponentFactoryResolver,
        private _ref: TemplateRef<{}>,
        private _container: ViewContainerRef,
    ) { }

    ngOnInit() {
        this._loading$
            .pipe(
                distinctUntilChanged(),
            ).subscribe(this._render);

        this._change$
            .pipe(
                filter(() => !!this._spinner),
            ).subscribe(() => this._updateSpinner(this._spinner!.instance));
    }

    ngOnChanges() {
        this._change$.next();
    }

    ngOnDestroy() {
        this._loading$.complete();
        this._change$.complete();
        this._destroySpinner();
    }

    private _render = (value: boolean) => {
        this._destroySpinner();
        this._container.clear();

        if (value) {
            const factory = this._resolver.resolveComponentFactory(UiContentSpinnerComponent);
            this._spinner = this._container.createComponent(factory);
            this._updateSpinner(this._spinner.instance);
        } else {
            this._container.createEmbeddedView(this._ref);
        }
    }

    private _updateSpinner = (spinner: UiContentSpinnerComponent) => {
        this._emitIfChanged(spinner.mode$, this.uiContentLoadingMode);
        this._emitIfChanged(spinner.diameter$, this.uiContentLoadingDiameter);
        this._emitIfChanged(spinner.color$, this.uiContentLoadingColor);
        this._emitIfChanged(spinner.value$, this.uiContentLoadingValue);
    }

    private _emitIfChanged = <T>(
        source: BehaviorSubject<T>,
        value?: T,
    ) => {
        if (
            value == null ||
            value === source.value
        ) { return; }

        source.next(value);
    }

    private _destroySpinner = () => {
        if (!this._spinner) { return; }

        this._spinner.destroy();
        this._spinner = undefined;
    }
}

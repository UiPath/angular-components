import {
    ComponentFactoryResolver,
    ComponentRef,
    Directive,
    OnChanges,
    OnDestroy,
    SimpleChange,
    SimpleChanges,
    Type,
    ViewContainerRef,
} from '@angular/core';

@Directive()
export abstract class UiLoaderButtonDirective<T> implements OnChanges, OnDestroy {
    protected _loader: T;
    protected _loaderElement: HTMLElement;
    protected _loaderRef: ComponentRef<T>;

    protected get _buttonElement(): HTMLButtonElement {
        return this._container.element.nativeElement;
    }

    private _watchers = new Map<string, () => void>();

    constructor(
        loaderType: Type<T>,
        private _componentFactory: ComponentFactoryResolver,
        private _container: ViewContainerRef,
    ) {
        this._loaderRef = this._createLoader(loaderType);
        this._loader = this._loaderRef.instance;
        this._loaderElement = this._loaderRef.location.nativeElement;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (!this._loaderElement) { return; }

        for (const watcher of this._watchers) {
            const [key, action] = watcher;

            this._doIfChange(changes[key as string], action);
        }
    }

    ngOnDestroy() {
        this._loaderRef.destroy();
    }

    protected _initialize() {
        this._watchers
            .forEach(action => {
                action();
            });
    }

    protected _registerWatcher = (key: string, action: () => void) => {
        this._watchers.set(key, action);
    }

    protected _createLoader = (type: Type<T>) => {
        const factory = this._componentFactory.resolveComponentFactory(type);
        return this._container.createComponent(factory, 0, this._container.injector);
    }

    protected _doIfChange = (change: SimpleChange, action: () => void) => {
        if (
            !change ||
            change.currentValue === change.previousValue
        ) { return; }

        action();
    }
}

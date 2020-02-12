import {
    ChangeDetectionStrategy,
    Component,
    Inject,
    Input,
    OnDestroy,
    OnInit,
    Optional,
    Renderer2,
} from '@angular/core';

import {
    BehaviorSubject,
    combineLatest,
    Observable,
    Subject,
} from 'rxjs';
import {
    map,
    startWith,
    takeUntil,
} from 'rxjs/operators';

import { UiPasswordToggleIntl } from './ui-password-toggle.intl';

@Component({
    selector: 'ui-password-toggle',
    templateUrl: './ui-password-toggle.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiPasswordToggleComponent implements OnInit, OnDestroy {
    /**
     * The input element that needs to be toggled.
     *
     */
    @Input()
    public element?: HTMLInputElement;

    /**
     * The disabled state of the toggle.
     *
     */
    @Input()
    public disabled?: boolean;

    /**
     * Emits the password input visibility state.
     *
     */
    public isVisible$ = new BehaviorSubject(false);

    /**
     * Emits the password toggle active tooltip.
     *
     */
    public tooltip$: Observable<string>;

    private _destroyed$ = new Subject();

    private get _isVisible() {
        return this.isVisible$.value;
    }

    constructor(
        @Inject(UiPasswordToggleIntl)
        @Optional()
        private _intl: UiPasswordToggleIntl,
        private _renderer: Renderer2,
    ) {
        this._intl = this._intl || new UiPasswordToggleIntl();

        this.tooltip$ = combineLatest([
            this.isVisible$,
            this._intl.changes
                .pipe(startWith(void 0)),
        ]).pipe(
            map(([isVisible]) => isVisible ? this._intl.tooltipHide : this._intl.tooltipShow),
            takeUntil(this._destroyed$),
        );
    }

    ngOnInit() {
        if (
            !!this.element &&
            this.element instanceof HTMLInputElement
        ) { return; }

        throw new Error('The password toggle must be bound to an input element!');
    }

    ngOnDestroy() {
        this.isVisible$.complete();
        this._destroyed$.next();
        this._destroyed$.complete();
    }

    public toggle() {
        this._toggleVisibiltyState();

        const type = this._isVisible ? 'text' : 'password';
        this._renderer.setProperty(this.element, 'type', type);
    }

    private _toggleVisibiltyState = () => {
        this.isVisible$.next(!this._isVisible);
    }
}

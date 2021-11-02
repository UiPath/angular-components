import {
    Subject,
    Subscription,
} from 'rxjs';
import {
    takeUntil,
    tap,
} from 'rxjs/operators';

import {
    AriaDescriber,
    FocusMonitor,
} from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { Overlay } from '@angular/cdk/overlay';
import { Platform } from '@angular/cdk/platform';
import { ScrollDispatcher } from '@angular/cdk/scrolling';
import { DOCUMENT } from '@angular/common';
import {
    AfterViewInit,
    ContentChild,
    Directive,
    ElementRef,
    Inject,
    NgZone,
    OnDestroy,
    Optional,
    ViewContainerRef,
} from '@angular/core';
import { MatFormFieldControl } from '@angular/material/form-field';
import {
    MatTooltip,
    MatTooltipDefaultOptions,
    MAT_TOOLTIP_DEFAULT_OPTIONS,
    MAT_TOOLTIP_SCROLL_STRATEGY,
} from '@angular/material/tooltip';

import {
    UiMatFormFieldRequiredIntl,
} from './ui-matformfield-required.directive.intl';

const MATFORMFIELD_LABEL_SELECTOR = '.mat-form-field-label-wrapper label';

@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: `mat-form-field`,
})
export class UiMatFormFieldRequiredDirective implements AfterViewInit, OnDestroy {
    @ContentChild(MatFormFieldControl)
    set matControl(matControl: MatFormFieldControl<any>) {
        if (this._matControlSubscription) {
            this._matControlSubscription.unsubscribe();
        }
        this._matControlSubscription = matControl.stateChanges.pipe(
            takeUntil(this._destroyed$),
        ).subscribe(this._updateDisableTooltipProperty(matControl));
    }

    private _matControlSubscription?: Subscription;
    private _tooltip?: MatTooltip;
    private _labelElement?: HTMLElement;
    private _destroyed$ = new Subject<void>();

    constructor(
        private _overlay: Overlay,
        private _elemRef: ElementRef,
        private _scrollDispatcher: ScrollDispatcher,
        private _viewContainerRef: ViewContainerRef,
        private _ngZone: NgZone,
        private _platform: Platform,
        private _ariaDescriber: AriaDescriber,
        private _focusMonitor: FocusMonitor,
        @Inject(MAT_TOOLTIP_SCROLL_STRATEGY)
        private _scrollStrategy: any,
        @Optional()
        private _dir: Directionality,
        @Optional()
        @Inject(MAT_TOOLTIP_DEFAULT_OPTIONS)
        private _defaultOptions: MatTooltipDefaultOptions,
        @Inject(DOCUMENT)
        private _document: any,
        @Optional()
        public intl: UiMatFormFieldRequiredIntl) {
        this.intl = this.intl || new UiMatFormFieldRequiredIntl();
    }

    ngAfterViewInit() {
        // attach tooltip on the span, which is the parent of label
        this._labelElement = this._elemRef.nativeElement.querySelector(MATFORMFIELD_LABEL_SELECTOR)?.parentNode;

        if (this._elemRef.nativeElement.querySelector('[required]')
            && !this._elemRef.nativeElement.classList.contains('mat-form-field-disabled')) {
            this._createMatTooltip();
        }
    }

    ngOnDestroy() {
        this._destroyed$.next();
        this._destroyed$.complete();
    }

    private _updateDisableTooltipProperty(matControl: MatFormFieldControl<any>) {
        return () => {
            if (this._tooltip && (!matControl.required || matControl.disabled)) {
                this._tooltip.disabled = true;
            }
            if (matControl.required && !matControl.disabled) {
                if (this._tooltip) {
                    this._tooltip.disabled = false;
                } else {
                    this._createMatTooltip();
                }
            }
        };
    }

    private _createMatTooltip() {
        if (!this._labelElement) { return; }

        const labelElementRef = new ElementRef(this._labelElement!);
        // FIXME: should find another way to instantiate the MatTooltip
        // https://github.com/angular/angular/issues/8785
        this._tooltip = new MatTooltip(
            this._overlay,
            labelElementRef,
            this._scrollDispatcher,
            this._viewContainerRef,
            this._ngZone,
            this._platform,
            this._ariaDescriber,
            this._focusMonitor,
            this._scrollStrategy,
            this._dir,
            this._defaultOptions,
            this._document,
        );

        this._tooltip.message = this.intl.tooltipMessage;
        // eslint-disable-next-line @angular-eslint/no-lifecycle-call
        this._tooltip.ngAfterViewInit();

        this.intl.changes.pipe(
            tap(() => this._tooltip!.message = this.intl.tooltipMessage),
            takeUntil(this._destroyed$),
        ).subscribe();
    }
}

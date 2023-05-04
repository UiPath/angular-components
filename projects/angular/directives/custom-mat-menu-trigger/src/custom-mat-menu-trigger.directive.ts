import {
    Subject,
    takeUntil,
} from 'rxjs';

import {
    FocusMonitor,
    LiveAnnouncer,
} from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { Overlay } from '@angular/cdk/overlay';
import {
    AfterContentInit,
    AfterViewInit,
    Directive,
    ElementRef,
    Inject,
    Input,
    OnDestroy,
    Optional,
    Self,
    ViewContainerRef,
} from '@angular/core';
import {
    MatMenuItem,
    MatMenuPanel,
    MAT_MENU_PANEL,
    MAT_MENU_SCROLL_STRATEGY,
    _MatMenuTriggerBase,
} from '@angular/material/menu';

@Directive({
    selector: '[uiCustomMatMenuTriggerFor]',
})
export class UiCustomMatMenuTriggerDirective extends _MatMenuTriggerBase implements AfterContentInit, AfterViewInit, OnDestroy {
    @Input()
    expandedTranslation = 'expanded';

    nativeElement: HTMLElement;
    private _destroyed$ = new Subject<void>();

    constructor(
        overlay: Overlay,
        element: ElementRef<HTMLElement>,
        viewContainerRef: ViewContainerRef,
        @Inject(MAT_MENU_SCROLL_STRATEGY) scrollStrategy: any,
        @Inject(MAT_MENU_PANEL) @Optional() parentMenu: MatMenuPanel,
        @Optional() @Self() menuItemInstance: MatMenuItem,
        @Optional() dir: Directionality,
        focusMonitor: FocusMonitor | null,
        private _liveAnnouncer: LiveAnnouncer,
    ) {
        super(overlay, element, viewContainerRef, scrollStrategy, parentMenu, menuItemInstance, dir, focusMonitor);
        this.nativeElement = element.nativeElement;
    }
    ngAfterViewInit(): void {
        this.nativeElement.setAttribute('aria-expanded', 'false');
    }

    ngAfterContentInit() {
        this.menuOpened.pipe(
            takeUntil(this._destroyed$),
        ).subscribe(() => {
            // although setting aria-expanded to true, it is not announced
            this.nativeElement.setAttribute('aria-expanded', 'true');
            this._liveAnnouncer.announce(this.expandedTranslation);

            // after closing the menu it would appear for a short time as expanded
            // therefore we set it as collapsed before it is actually closed
            setTimeout(() => {
                this.nativeElement.setAttribute('aria-expanded', 'false');
            }, 100);
        });

        this.menuClosed.pipe(
            takeUntil(this._destroyed$),
        ).subscribe(() => {
            this.nativeElement.setAttribute('aria-expanded', 'false');

            // timeout is required because
            // after focusing another element then returning to this one, it will lose collapsed state
            setTimeout(() => {
                this.nativeElement.setAttribute('aria-expanded', 'false');
            }, 100);
        });
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this._destroyed$.next();
        this._destroyed$.complete();
    }
}


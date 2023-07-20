import {
    Subject,
    takeUntil,
} from 'rxjs';

import { LiveAnnouncer } from '@angular/cdk/a11y';
import {
    AfterContentInit,
    Directive,
    ElementRef,
    HostBinding,
    inject,
    Input,
    OnDestroy,
} from '@angular/core';
import { MatMenuTrigger as _MatMenuTriggerBase } from '@angular/material/menu';

//  FIXME: this directive will not be necessary anymore in the @angular/material@15.x version
// its sole purpose is to fix the aria-expanded issue https://github.com/angular/components/issues/26262

@Directive({
    selector: '[uiCustomMatMenuTriggerFor]',
})
export class UiCustomMatMenuTriggerDirective extends _MatMenuTriggerBase implements AfterContentInit, OnDestroy {
    @HostBinding()
    ariaExpanded = false;

    @Input()
    expandedTranslation = 'expanded';

    nativeElement = inject(ElementRef<HTMLElement>).nativeElement;

    private _liveAnnouncer = inject(LiveAnnouncer);
    private _destroyed$ = new Subject<void>();
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


import { DOCUMENT } from '@angular/common';
import {
    Directive,
    ElementRef,
    Inject,
    Injectable,
    OnDestroy,
    Output,
} from '@angular/core';

import {
    fromEvent,
    Observable,
    Subject,
} from 'rxjs';
import {
    filter,
    share,
    takeUntil,
    throttleTime,
} from 'rxjs/operators';

/**
  *   Info:
  *
  *   On average a user trying hard enough can reach ~7 click/s
  *   We'll reduce the click event count to half
  *
  *   Benefits:
  *
  *   - drastically reduce misclick emissions
  * @ignore
 */
const MAX_CLICKS_PER_SECOND = 3;

/**
 * A service that shares the `global` events required for the `uiClickOutside` directive.
 * By sharing the event stream, we end up adding only one event listener rather than {N}.
 *
 * @export
 */
@Injectable({
    providedIn: 'root',
})
export class UiClickOutsideService implements OnDestroy {
    /**
   * The `global` event handler for `click` events.
   *
   */
    public source: Observable<MouseEvent>;
    private _destroyed$ = new Subject();

    /**
    * @ignore
    */
    constructor(
    @Inject(DOCUMENT)
        document: any,
    ) {
        this.source = fromEvent<MouseEvent>((document as Document).body, 'click', {
            capture: true,
        })
            .pipe(
                throttleTime(1000 / MAX_CLICKS_PER_SECOND),
                takeUntil(this._destroyed$),
                share(),
            );
    }

    /**
    * @ignore
    */
    ngOnDestroy() {
        this._destroyed$.next();
    }
}

/**
 * A directive that emits when a click event occurs outside of the decorated element.
 *
 * @export
 */
@Directive({
    selector: '[uiClickOutside]',
})
export class UiClickOutsideDirective {
  /**
   * Emits the original `MouseEvent` when the click occurs outside of the decorated element.
   *
   */
  @Output()
    public uiClickOutside: Observable<MouseEvent>;

  /**
    * @ignore
    */
  constructor(
      ref: ElementRef,
      private _clickService: UiClickOutsideService,
  ) {
      const element: HTMLElement = ref.nativeElement;

      this.uiClickOutside = this._clickService
          .source
          .pipe(
              filter(ev =>
                  !element.contains((ev.target as Element)),
              ),
          );
  }
}

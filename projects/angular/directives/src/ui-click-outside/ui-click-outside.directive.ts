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

/*
*   Info:
*
*   On average a user trying hard enough cand reach ~7 click/s
*   We'll reduce the click event count to half
*
*   Benefits:
*
*   - drastically reduce misclick emissions
*/
const MAX_CLICKS_PER_SECOND = 3;

@Injectable()
export class UiClickOutsideService implements OnDestroy {
  public source: Observable<MouseEvent>;
  private _destroyed$ = new Subject();

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

  ngOnDestroy() {
    this._destroyed$.next();
  }
}

@Directive({
  selector: '[uiClickOutside]',
})
export class UiClickOutsideDirective {
  @Output()
  public uiClickOutside: Observable<MouseEvent>;

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

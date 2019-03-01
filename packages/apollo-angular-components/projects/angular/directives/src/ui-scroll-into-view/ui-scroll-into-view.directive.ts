import {
  Directive,
  ElementRef,
  Input,
  NgZone,
} from '@angular/core';

import { merge } from 'rxjs';
import { take } from 'rxjs/operators';
import scrollIntoViewIfNeeded from 'scroll-into-view-if-needed';

type Boundary = 'parent' | Element;

@Directive({
  selector: '[uiScrollIntoView]',
})
export class UiScrollIntoViewDirective {
  @Input()
  public boundary: Boundary = 'parent';

  @Input()
  public set uiScrollIntoView(condition: boolean) {
    this._zone.runOutsideAngular(() => {
      if (!condition) { return; }
      merge(
        this._zone.onMicrotaskEmpty,
        this._zone.onStable,
      ).
        pipe(
          take(1),
        ).subscribe(() => {
          this.scrollIntoViewIfNeeded(
            this._element.nativeElement, {
              block: 'start',
              boundary: this.boundary === 'parent' ?
                this._element.nativeElement.parentElement :
                this.boundary,
            },
          );
        });
    });
  }


  constructor(
    private _element: ElementRef,
    private _zone: NgZone,
  ) { }

  public scrollIntoViewIfNeeded = (...args: any) => scrollIntoViewIfNeeded.apply(null, args);
}

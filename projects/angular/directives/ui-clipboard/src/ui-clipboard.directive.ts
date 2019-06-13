import {
    Directive,
    ElementRef,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
} from '@angular/core';

import * as Clipboard from 'clipboard';

/**
 * A directive that copies the decorated element content into the user clipboard.
 *
 * Depends On: [clipboard](https://www.npmjs.com/package/clipboard)
 *
 * @export
 */
@Directive({
    selector: '[uiClipboard]',
})
export class UiClipboardDirective implements OnInit, OnDestroy {
  /**
   * The element reference what will serve as a `copy` trigger.
   *
   */
  @Input()
    public uiClipboard?: Element;

  /**
   * Event that emits when the content is copied succesfully to the clipboard.
   *
   */
  @Output()
  public clipboardSuccess: EventEmitter<Clipboard.Event> = new EventEmitter();

  /**
   * Event that emits when the content could not be copied to the clipboard.
   *
   */
  @Output()
  public clipboardError: EventEmitter<Clipboard.Event> = new EventEmitter();

  private _clipboard!: Clipboard;

  /**
    * @ignore
    */
  constructor(private _eltRef: ElementRef) { }

  /**
    * @ignore
    */
  ngOnInit() {
      if (!this.uiClipboard) {
          throw new Error('Missing uiClipboard reference');
      }

      this._clipboard = new Clipboard(this._eltRef.nativeElement, {
          target: () => {
              return this.uiClipboard!;
          },
      });

      this._clipboard.on('success', (e) => {
          this.clipboardSuccess.emit(e);
      });

      this._clipboard.on('error', (e) => {
          this.clipboardError.emit(e);
      });
  }

  /**
    * @ignore
    */
  ngOnDestroy() {
      if (this._clipboard) {
          this._clipboard.destroy();
      }
  }
}

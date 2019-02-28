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

@Directive({
  selector: '[uiClipboard]',
})
export class UiClipboardDirective implements OnInit, OnDestroy {
  @Input()
  public uiClipboard: Element;

  @Output()
  public clipboardSuccess: EventEmitter<Clipboard.Event> = new EventEmitter();

  @Output()
  public clipboardError: EventEmitter<Clipboard.Event> = new EventEmitter();

  private _clipboard: Clipboard;

  constructor(private _eltRef: ElementRef) { }

  ngOnInit() {
      this._clipboard = new Clipboard(this._eltRef.nativeElement, {
          target: () => {
              return this.uiClipboard;
          },
      });

      this._clipboard.on('success', (e) => {
          this.clipboardSuccess.emit(e);
      });

      this._clipboard.on('error', (e) => {
          this.clipboardError.emit(e);
      });
  }

  ngOnDestroy() {
      if (this._clipboard) {
          this._clipboard.destroy();
      }
  }
}

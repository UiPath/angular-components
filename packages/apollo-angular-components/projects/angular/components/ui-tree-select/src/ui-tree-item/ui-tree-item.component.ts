import { FocusableOption } from '@angular/cdk/a11y';
import {
  Component,
  ChangeDetectionStrategy,
  Input,
  ViewEncapsulation,
  ElementRef,
  forwardRef,
  Inject,
  Output,
  EventEmitter,
} from '@angular/core';
import { IFlatNodeObject } from '../models/tree.models';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ui-tree-item[node]',
  templateUrl: './ui-tree-item.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class UiTreeItemComponent implements FocusableOption {
  @Input()
  node!: IFlatNodeObject;

  @Input()
  isSelected = false;

  @Output()
  expanded = new EventEmitter<void>();

  @Output()
  selected = new EventEmitter<void>();

  constructor(
    @Inject(forwardRef(() => ElementRef))
    private readonly _el: ElementRef,
  ) { }

  click() {
    this.selected.emit();
  }

  dblclick() {
    this.selected.emit();
    this.expanded.emit();
  }

  focus() {
    this._el.nativeElement.querySelector('.mat-list-item').focus();
  }
}

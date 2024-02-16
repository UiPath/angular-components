import { FocusableOption } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    forwardRef,
    Inject,
    Input,
    Output,
    ViewEncapsulation,
} from '@angular/core';
import { MatListModule } from '@angular/material/list';

import { IFlatNodeObject } from '../models/tree.models';

const LIST_ITEM_SELECTOR = '.mat-mdc-list-item';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
  ],
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

  @Input()
  isExpanded = false;

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
    this._el.nativeElement.querySelector(LIST_ITEM_SELECTOR).focus();
  }

  getBoundingClientRect() {
    return this._el.nativeElement.querySelector(LIST_ITEM_SELECTOR).getBoundingClientRect();
  }
}

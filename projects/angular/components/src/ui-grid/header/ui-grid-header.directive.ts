import {
  AfterViewInit,
  ContentChildren,
  Directive,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  QueryList,
} from '@angular/core';

import { IFilterModel } from '../models';
import { UiGridHeaderButtonDirective } from './ui-grid-header-button.directive';

@Directive({
    selector: '[uiGridHeader], ui-grid-header',
})
export class UiGridHeaderDirective<T> implements AfterViewInit, OnDestroy {
    @Input()
    public search = false;

    @Input()
    public searchValue?: string;

    @Input()
    public searchDebounce = 500;

    @Input()
    public searchMaxLength = 64;

    @Output()
    public searchFilter = new EventEmitter<IFilterModel<T>[]>();

    @Output()
    public searchTerm = new EventEmitter<string>();

    public mainButton?: UiGridHeaderButtonDirective;

    public actionButtons?: UiGridHeaderButtonDirective[];

    @ContentChildren(UiGridHeaderButtonDirective)
    private _buttons!: QueryList<UiGridHeaderButtonDirective>;

    ngAfterViewInit() {
        this.mainButton = this._buttons.find(b => b.type === 'main');
        this.actionButtons = this._buttons.filter(b => b.type === 'action');
    }

    ngOnDestroy() {
        this.searchFilter.complete();
        this.searchTerm.complete();
    }
}

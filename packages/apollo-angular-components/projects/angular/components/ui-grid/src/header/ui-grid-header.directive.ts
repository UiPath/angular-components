import type { QueryList } from '@angular/core';
import {
    AfterViewInit,
    ContentChildren,
    Directive,
    EventEmitter,
    Input,
    OnDestroy,
    Output,
} from '@angular/core';

import { IFilterModel } from '../models';
import { UiGridHeaderButtonDirective } from './ui-grid-header-button.directive';

/**
 * Grid header definition directive.
 *
 * @export
 */
@Directive({
    selector: '[uiGridHeader], ui-grid-header',
})
export class UiGridHeaderDirective<T> implements AfterViewInit, OnDestroy {
    /**
     * If the search input is available.
     *
     */
    @Input()
    search = false;

    /**
     * The active search value.
     *
     */
    @Input()
    searchValue?: string;

    /**
     * The search debounce time (ms).
     *
     */
    @Input()
    searchDebounce = 500;

    /**
     * The search max length.
     *
     */
    @Input()
    searchMaxLength = 64;

    /**
     * Emits a filter model event when the search changes.
     *
     */
    @Output()
    searchFilter = new EventEmitter<IFilterModel<T>[]>();

    /**
     * Emits the search term when the search changes.
     *
     */
    @Output()
    searchTerm = new EventEmitter<string>();

    /**
     * @internal
     * @ignore
     */
    mainButtons?: UiGridHeaderButtonDirective[];

    /**
     * @internal
     * @ignore
     */
    actionButtons?: UiGridHeaderButtonDirective[];

    /**
     * @internal
     * @ignore
     */
    inlineButtons?: UiGridHeaderButtonDirective[];

    @ContentChildren(UiGridHeaderButtonDirective)
    private _buttons!: QueryList<UiGridHeaderButtonDirective>;

    /**
     * @internal
     * @ignore
     */
    ngAfterViewInit() {
        this.mainButtons = this._buttons.filter(b => b.type === 'main');
        this.actionButtons = this._buttons.filter(b => b.type === 'action');
        this.inlineButtons = this._buttons.filter(b => b.type === 'inline');
    }

    /**
     * @internal
     * @ignore
     */
    ngOnDestroy() {
        this.searchFilter.complete();
        this.searchTerm.complete();
    }
}

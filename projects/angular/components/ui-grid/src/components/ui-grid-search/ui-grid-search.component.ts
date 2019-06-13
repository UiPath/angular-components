import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewEncapsulation,
} from '@angular/core';
import { FormControl } from '@angular/forms';

import { Subject } from 'rxjs';
import {
    debounceTime,
    distinctUntilChanged,
    map,
    takeUntil,
} from 'rxjs/operators';

/**
 * The grid search component.
 *
 * @export
 */
@Component({
    selector: 'ui-grid-search',
    templateUrl: './ui-grid-search.component.html',
    styleUrls: ['./ui-grid-search.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiGridSearchComponent implements OnInit, OnDestroy {
    /**
     * The search debounce time (ms).
     *
     */
    @Input()
    public debounce = 0;
    /**
     * The search input placeholder.
     *
     */
    @Input()
    public placeholder?: string;
    /**
     * The max-length allowed in the search input.
     *
     */
    @Input()
    public maxLength?: number;
    /**
     * The search tooltip text.
     *
     */
    @Input()
    public searchTooltip?: string;
    /**
     * The clear search tooltip text.
     *
     */
    @Input()
    public clearTooltip?: string;
    /**
     * Configure if the search tooltip is disabled.
     *
     */
    @Input()
    public tooltipDisabled?: boolean;

    /**
     * The search value.
     *
     */
    @Input()
    public get value() {
        return this.search.value;
    }
    public set value(value: string) {
        this.search.setValue(value);
    }

    /**
     * @ignore
     */
    public search = new FormControl('');

    /**
     * The search event.
     *
     */
    @Output()
    public searchChange = new EventEmitter<string>();

    private _destroyed$ = new Subject();

    /**
     * @ignore
     */
    ngOnInit() {
        this.search.valueChanges.pipe(
            debounceTime(this.debounce),
            map(value => value.trim()),
            distinctUntilChanged(),
            takeUntil(this._destroyed$),
        ).subscribe(value => this.searchChange.emit(value));
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.searchChange.complete();

        this._destroyed$.next();
        this._destroyed$.complete();
    }

    /**
     * Clears the search input value.
     *
     */
    public clear() {
        this.search.setValue('');
    }
}

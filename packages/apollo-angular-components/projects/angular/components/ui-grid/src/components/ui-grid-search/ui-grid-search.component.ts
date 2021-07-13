import { Subject } from 'rxjs';
import {
    debounceTime,
    distinctUntilChanged,
    map,
    takeUntil,
} from 'rxjs/operators';

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
    debounce = 0;
    /**
     * The search input placeholder.
     *
     */
    @Input()
    placeholder?: string;
    /**
     * The max-length allowed in the search input.
     *
     */
    @Input()
    maxLength?: number;
    /**
     * The search tooltip text.
     *
     */
    @Input()
    searchTooltip?: string;
    /**
     * The clear search tooltip text.
     *
     */
    @Input()
    clearTooltip?: string;
    /**
     * Configure if the search tooltip is disabled.
     *
     */
    @Input()
    tooltipDisabled?: boolean;

    /**
     * The search value.
     *
     */
    @Input()
    get value() {
        return this.search.value;
    }
    set value(value: string) {
        this.search.setValue(value);
    }

    /**
     * @ignore
     */
    search = new FormControl('');

    /**
     * The search event.
     *
     */
    @Output()
    searchChange = new EventEmitter<string>();

    private _destroyed$ = new Subject<void>();

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
    clear() {
        this.search.setValue('');
    }
}

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

@Component({
    selector: 'ui-grid-search',
    templateUrl: './ui-grid-search.component.html',
    styleUrls: ['./ui-grid-search.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiGridSearchComponent implements OnInit, OnDestroy {
    @Input()
    public debounce = 0;
    @Input()
    public placeholder?: string;
    @Input()
    public maxLength?: number;
    @Input()
    public searchTooltip?: string;
    @Input()
    public clearTooltip?: string;
    @Input()
    public toolipDisabled?: boolean;
    @Input()
    public get value() {
        return this.search.value;
    }
    public set value(value: string) {
        this.search.setValue(value);
    }

    public search = new FormControl('');

    @Output()
    public searchChange = new EventEmitter<string>();

    private _destroyed$ = new Subject();

    ngOnInit() {
        this.search.valueChanges.pipe(
            debounceTime(this.debounce),
            map(value => value.trim()),
            distinctUntilChanged(),
            takeUntil(this._destroyed$),
        ).subscribe(value => this.searchChange.emit(value));
    }

    ngOnDestroy() {
        this.searchChange.complete();

        this._destroyed$.next();
        this._destroyed$.complete();
    }

    public clear() {
        this.search.setValue('');
    }
}

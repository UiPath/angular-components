import { ListRange } from '@angular/cdk/collections';
import {
    ChangeDetectionStrategy, Component, Directive, Input,
} from '@angular/core';
import { SuggestDirection } from '@uipath/angular/components/ui-suggest';
import {
    BehaviorSubject, Subject,
} from 'rxjs';

@Directive()
export abstract class UiAutocompleteComponentBase {

    /**
     * Set a custom size for the list items.
     *
     */
    @Input()
    itemSize?: number;

    @Input()
    viewportMaxHeight?: number;

    @Input()
    minChars = 3;

    @Input()
    searchValue = '';

    /**
     * Determines if the render direction is `down`.
     *
     */
    get isDown() {
        return this._direction === 'down';
    }

    @Input()
    set direction(value: SuggestDirection) {
        this._direction = value;
    }
    get direction() {
        return this._direction;
    }

    loading$ = new BehaviorSubject(false);

    private _direction: SuggestDirection = 'down';
    private _triggerViewportRefresh$ = new BehaviorSubject<null>(null);
    private _destroyed$ = new Subject<void>();
    private _scrollTo$ = new Subject<number>();
    private _rangeLoad$ = new Subject<ListRange>();
    private _fetchStrategy$ = new BehaviorSubject<'eager' | 'onOpen'>('eager');
    private _isOpen$ = new BehaviorSubject(false);

    /**
     * Is called every time a new range needs to be loaded.
     *
     * @ignore
     */
    rangeLoad = (range: ListRange) => this._rangeLoad$.next(range);
}

@Component({
    selector: 'ui-autocomplete',
    templateUrl: './ui-autocomplete.component.html',
    styleUrls: ['./ui-autocomplete.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiAutocompleteComponent extends UiAutocompleteComponentBase {

}

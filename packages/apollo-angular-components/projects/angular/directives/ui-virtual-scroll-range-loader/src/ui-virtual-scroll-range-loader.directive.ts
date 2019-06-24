import { ListRange } from '@angular/cdk/collections';
import {
    CdkVirtualForOf,
    CdkVirtualScrollViewport,
} from '@angular/cdk/scrolling';
import {
    ContentChild,
    Directive,
    EventEmitter,
    Inject,
    Input,
    OnDestroy,
    OnInit,
    Output,
    Self,
} from '@angular/core';

import { Subject } from 'rxjs';
import {
    debounceTime,
    distinctUntilChanged,
    filter,
    map,
    startWith,
    takeUntil,
    tap,
    withLatestFrom,
} from 'rxjs/operators';

/**
 * Used for marking the loading state of items
 * within a lazily loaded collection
 *
 * @export
 */
export enum VirtualScrollItemStatus {
    /**
     * Initial status of an item within the collection,
     * a placeholder with no content
     */
    initial = 'initial',
    /**
     * Item marked as pending to be loaded, a request was sent out,
     * but still no content, item data was not yet received
     */
    pending = 'pending',
    /**
     * Item with content, data of item has been loaded
     */
    loaded = 'loaded',
}

/**
 * Item with loading state to be used
 * if lazily loading results to reduce events emitted
 * and intervals emitted within events on `rangeLoad` Output
 * @export
 */
export interface VirtualScrollItem {
    loading?: VirtualScrollItemStatus;
}

/**
 * A directive that is designed to work alongside CdkVirtualScrollViewport
 * which can be used to lazy load in chunks depending on what is in view
 * @export
 */
@Directive({
    selector: '[uiVirtualScrollRangeLoader], ui-virtual-scroll-range-loader',
})
export class UiVirtualScrollRangeLoaderDirective implements OnInit, OnDestroy {

    /**
     * Used to extend the ListRange interval emmited by rangeLoad Output
     * this will expand at both ends with the specified number,
     * taking into account the status of the loading items
     * available
     *
     */
    @Input()
    public buffer = 10;

    /**
     * Flag used to indicate the direction of items
     * set to `false` if virtual scroll events indexes need to be reversed
     */
    @Input()
    public isDown = true;

    /**
     * Output of `ListRange` events based on renderedRangeStream from
     * CdkVirtualScrollViewport which takes into account
     * direction of list (`isDown`), `buffer`
     * and reduces interval to untouched indexes (items with `loading: "initial"`)
     *
     */
    @Output()
    public rangeLoad = new EventEmitter<ListRange>();

    @ContentChild(CdkVirtualForOf, {
        static: true,
    })
    private readonly _cdkVirtualForOf!: CdkVirtualForOf<VirtualScrollItem>;

    private readonly _destroyed$ = new Subject();

    /**
     * @ignore
     */
    constructor(
        @Self()
        @Inject(CdkVirtualScrollViewport)
        private readonly _viewport: CdkVirtualScrollViewport,
    ) { }

    /**
     * @ignore
     */
    ngOnInit() {
        this._viewport.renderedRangeStream
            .pipe(
                withLatestFrom(
                    this._cdkVirtualForOf.dataStream.pipe(
                        startWith([] as VirtualScrollItem[]),
                    ),
                ),
                debounceTime(100),
                distinctUntilChanged(([list1], [list2]) => `${list1.start}${list1.end}` === `${list2.start}${list2.end}`),
                map(([range, items]) => ({
                    ...range,
                    items,
                })),
                map(({ start, end, items }) => ({
                    ...this._adjustLoadingRange(start, end, this.buffer, items),
                    items,
                })),
                filter(({ start, end }) => this._isValidRange({ start, end })),
                map(({ start, end, items }) =>
                    this.isDown ?
                        { start, end } :
                        this._reverseIndex({ start, end }, items.length),
                ),
                filter(this._isValidRange),
                tap(range => this.rangeLoad.emit(range)),
            )
            .pipe(takeUntil(this._destroyed$))
            .subscribe();
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this._destroyed$.next();
        this._destroyed$.complete();
    }

    private _isValidRange = ({ start, end }: ListRange) => end >= 0 && start >= 0 && end - start >= 0;
    private _reverseIndex({ start, end }: ListRange, count: number) {
        return {
            start: count - 1 - end,
            end: count - 1 - start,
        };
    }

    private _adjustLoadingRange(
        start: number,
        end: number,
        buffer: number,
        items: VirtualScrollItem[] | ReadonlyArray<VirtualScrollItem>): ListRange {
        (
            { start, end } = this._addSafeBuffer(start, end, buffer, items)
        );

        let isTrimmedBefore;
        let isTrimmedAfter;

        (
            { start, end, isTrimmedBefore, isTrimmedAfter } = this._trimInterval(start, end, items)
        );

        if (start > end) {
            // kill the request
            return { start, end: -1 };
        }

        const isNotTrimmedAtBothEnds = !isTrimmedBefore || !isTrimmedAfter;
        if (
            end - start < buffer &&
            isNotTrimmedAtBothEnds
        ) {
            if (!isTrimmedBefore) {
                start -= buffer;
            }
            if (!isTrimmedAfter) {
                end += buffer;
            }

            (
                { start, end } = this._trimInterval(
                    Math.max(0, start),
                    Math.min(items.length - 1, end),
                    items,
                )
            );
        }

        if (start > end) {
            // kill the request
            end = -1;
        }

        return { start, end };
    }

    private _addSafeBuffer(start: number, end: number, buffer: number, items: VirtualScrollItem[] | ReadonlyArray<VirtualScrollItem>) {
        end = Math.min(end + buffer, items.length - 1);
        start = Math.max(start - buffer, 0);
        return { start, end };
    }

    private _trimInterval(start: number, end: number, items: VirtualScrollItem[] | ReadonlyArray<VirtualScrollItem>) {
        let isTrimmedBefore = false;
        let isTrimmedAfter = false;
        while (start <= end &&
            items[start].loading !== VirtualScrollItemStatus.initial) {
            isTrimmedBefore = true;
            start += 1;
        }
        while (end >= start &&
            items[end].loading !== VirtualScrollItemStatus.initial) {
            isTrimmedAfter = true;
            end -= 1;
        }
        return { start, end, isTrimmedBefore, isTrimmedAfter };
    }
}

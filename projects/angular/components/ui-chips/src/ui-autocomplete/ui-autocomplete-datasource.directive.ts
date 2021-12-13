import {
    generateLoadingInitialCollection,
} from 'projects/angular/components/ui-chips/src/ui-autocomplete/items.utils';
import {
    setLoadedState,
} from 'projects/angular/components/ui-suggest/src/utils';
/* eslint-disable rxjs/finnish */
/* eslint-disable @angular-eslint/directive-selector */
import {
    BehaviorSubject,
    combineLatest,
    Observable,
    of,
    Subject,
} from 'rxjs';
import {
    debounceTime,
    distinctUntilChanged,
    filter,
    map,
    pluck,
    startWith,
    switchMap,
    takeUntil,
    tap,
    withLatestFrom,
} from 'rxjs/operators';

import {
    CollectionViewer,
    DataSource,
    ListRange,
} from '@angular/cdk/collections';
import {
    AfterViewInit,
    Directive,
    Input,
    Output,
} from '@angular/core';
import {
    ISuggestValueData,
    ISuggestValues,
} from '@uipath/angular/components/ui-suggest';
import {
    VirtualScrollItem,
    VirtualScrollItemStatus,
} from '@uipath/angular/directives/ui-virtual-scroll-range-loader';

import { SearchSourceFactory } from '../models';

@Directive({
    selector: 'uiAutocomplete[searchSourceFactory][searchTerm]',
})
export class UiAutocomopleteDataSourceDirective<T> implements AfterViewInit {

    @Input()
    searchSourceFactory!: SearchSourceFactory<T>;

    @Input()
    searchTerm!: Observable<string>;

    @Input()
    pageSize = 10;

    @Output()
    dataSource = new Subject<UiAutocomopleteDataSource<T>>();

    private _dataSource?: UiAutocomopleteDataSource<T>;

    ngAfterViewInit(): void {
        this._dataSource = new UiAutocomopleteDataSource<T>(this.searchSourceFactory, this.searchTerm);
        this.dataSource.next(this._dataSource);
    }
}

export class UiAutocomopleteDataSource<T> extends DataSource<ISuggestValueData<T>> {
    set searchSourceFactory(value: SearchSourceFactory<T>) {
        this._searchSourceFactory = value;
    }

    set searchInput(value: Observable<string>) {
        this._searchTerm$ = value;
    }

    get value() {
        return this._cachedData$.value;
    }

    private _searchSourceFactory!: SearchSourceFactory<T>;
    private _searchTerm$!: Observable<string>;

    private _cachedData$ = new BehaviorSubject<ISuggestValues<T>>({
        total: 0,
        data: [],
    });
    // private _dataStream$?: Observable<ISuggestValues<T>>;
    private _destroyed$ = new Subject();
    private _bufferSize = 10;
    private _isDown = true;

    constructor(
        searchSourceFactory: SearchSourceFactory<T>,
        searchInput: Observable<string>,
    ) {
        super();
        this.searchSourceFactory = searchSourceFactory;
        this.searchInput = searchInput;

        this._cachedData$?.next({});
    }

    connect(collectionViewer: CollectionViewer): Observable<ISuggestValueData<T>[]> {
        // const initial: [string, ListRange] = [
        //     '',
        //     {
        //         start: 0,
        //         end: this._bufferSize,
        //     },
        // ];

        // combineLatest([
        //     this._searchTerm$,
        //     collectionViewer.viewChange,
        // ]).pipe(
        //     // startWith(initial),
        //     switchMap(([_searchTerm, _range]) =>
        //         this._searchSourceFactory(_searchTerm, _range.end - _range.start, _range.start),
        //         // of([]),
        //     ),
        //     takeUntil(this._destroy$),
        // ).subscribe();

        // Range patching
        collectionViewer.viewChange
            .pipe(
                tap(console.log),
                withLatestFrom(
                    this._cachedData$.pipe(
                        pluck('data'),
                        filter(Boolean),
                        startWith([] as ISuggestValueData<T>[]),
                    ),
                ),
                distinctUntilChanged(([list1], [list2]) => `${list1.start}${list1.end}` === `${list2.start}${list2.end}`),
                debounceTime(100),
                // filter early, in case of false emissions like { 0,0 }
                filter(([{ start, end }]) => this._isValidRange({
                    start,
                    end,
                })),
                filter(this._filterTouchedRange),
                map(([{ start, end }, items]) => ({
                    ...this._adjustLoadingRange(start, end, this._bufferSize, items),
                    items,
                })),
                // eslint-disable-next-line sonarjs/no-identical-functions
                filter(({ start, end }) => this._isValidRange({
                    start,
                    end,
                })),
                map(({ start, end, items }) =>
                    this._isDown ?
                        {
                            start,
                            end,
                        } :
                        this._reverseIndex({
                            start,
                            end,
                        }, items.length),
                ),
                filter(this._isValidRange),
                // tap(range => this.rangeLoad.emit(range)),
                tap(({ start, end }) => console.log(`Patched range is: ${start} ${end}`)),
                withLatestFrom(this._searchTerm$.pipe(
                    filter(Boolean),
                    startWith(''),
                )),
                switchMap(([{ start, end }, searchTerm]) => combineLatest([
                    of({
                        start,
                        end,
                    }),
                    this._searchSourceFactory(searchTerm, end - start, start),
                ])),
                tap(([{ start }, items]) => {
                    const { data, total } = this._cachedData$.value;
                    const updatedData = setLoadedState(items.data, start, data ?? []);
                    this._cachedData$.next({
                        total,
                        data: updatedData,
                    });
                }),
                takeUntil(this._destroyed$),
            ).subscribe();

        // Initial caching
        this._searchTerm$.pipe(
            distinctUntilChanged(),
            switchMap((searchTerm) => this._searchSourceFactory(searchTerm, this._bufferSize, 0)
                .pipe(
                    map(({ total, data }) => {
                        const assertedTotal = total ?? 0;
                        const assertedData = data ?? [];

                        const remainingItems = assertedTotal - assertedData.length;

                        return {
                            total: assertedTotal,
                            data: [
                                ...assertedData,
                                ...generateLoadingInitialCollection('loading', remainingItems),
                            ],
                        };
                    }),
                )),
            takeUntil(this._destroyed$),
        ).subscribe(initialContext => {
            this._cachedData$?.next(initialContext);
        });

        return this._cachedData$!.pipe(
            pluck('data'),
            filter(Boolean),
        );
    }

    // check if range is loaded
    // isRangeLoaded(start: number, end: number) {
    //     // this._cachedData$.va;
    // }

    disconnect() {
        this._destroyed$.next(null);
        this._destroyed$.complete();
    }

    private _filterTouchedRange = (
        [{ start, end }, items]: [ListRange, VirtualScrollItem[] | readonly VirtualScrollItem[]],
    ) =>
        items
            .slice(start, end)
            .some(({ loading }) => loading === VirtualScrollItemStatus.initial);

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
        items: VirtualScrollItem[] | readonly VirtualScrollItem[]): ListRange {
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
            return {
                start,
                end: -1,
            };
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

        return {
            start,
            end,
        };
    }

    private _addSafeBuffer(start: number, end: number, buffer: number, items: VirtualScrollItem[] | readonly VirtualScrollItem[]) {
        end = Math.min(end + buffer, items.length - 1);
        start = Math.max(start - buffer, 0);
        return {
            start,
            end,
        };
    }

    private _trimInterval(start: number, end: number, items: VirtualScrollItem[] | readonly VirtualScrollItem[]) {
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
        return {
            start,
            end,
            isTrimmedBefore,
            isTrimmedAfter,
        };
    }
}

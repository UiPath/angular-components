import { cloneDeep } from 'lodash';
import {
    IFooter,
    IHeader,
    IInputs,
} from 'projects/playground/src/app/pages/grid/grid.models';
import { MockData } from 'projects/playground/src/app/pages/grid/grid.page';
import {
    BehaviorSubject,
    combineLatest,
    Observable,
    of,
    Subject,
} from 'rxjs';
import {
    delay,
    startWith,
    switchMap,
    takeUntil,
    tap,
} from 'rxjs/operators';

import {
    AfterViewInit,
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import {
    IFilterModel,
    PageChangeEvent,
    ResizeStrategy,
    UiGridComponent,
} from '@uipath/angular/components/ui-grid';
import { ISuggestValues } from '@uipath/angular/components/ui-suggest';

// eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
@Component({
    selector: 'ui-app-grid-component',
    styleUrls: ['./grid.component.scss'],
    templateUrl: './grid.component.html',
})
export class GridComponent implements OnInit, OnDestroy, AfterViewInit {
    @Input()
    readonly inputs!: IInputs;

    @Input()
    readonly header!: IHeader;

    @Input()
    readonly footer!: IFooter;

    @Input()
    allData!: MockData[];

    @Input()
    readonly inputKeys!: string[];

    @Output()
    visibleColumnsToggled = new EventEmitter<boolean>();

    pageSizes = [5, 10, 20];
    pageIndex = 0;
    data$ = new BehaviorSubject<MockData[]>([]);
    filteredData: MockData[] = [];
    total = 0;

    editedEntity?: any;
    editedIndex?: number;

    scrollableGridStrategy = ResizeStrategy.ScrollableGrid;

    @ViewChild(UiGridComponent)
    private _grid!: UiGridComponent<MockData>;

    private _destroyed$ = new Subject<void>();

    constructor() { }

    ngOnDestroy() {
        this._destroyed$.next();
        this._destroyed$.complete();
    }

    ngOnInit() {
        this.total = this.footer.total;
        this.filteredData = cloneDeep(this.allData);
        this.paginateData(this.filteredData, this.pageIndex, this.footer.pageSize);
    }

    ngAfterViewInit() {
        combineLatest([
            this._grid.header?.searchFilter.pipe(startWith([]))!,
            this._grid.filterManager.filter$,
        ]).pipe(
            takeUntil(this._destroyed$),
        ).subscribe(([searchFilters, filters]) => {
            this.filteredData = cloneDeep(this.allData);
            const filterValues = (filter: IFilterModel<any>) => {
                this.filteredData = this.filteredData.filter((row: any) => {
                    if (Array.isArray(filter.value)) {
                        return filter.value.length > 0 ? filter.value.some(value => row[filter.property]
                            .toString()
                            .includes(value)) : true;
                    }
                    return row[filter.property]
                        .toString()
                        .includes(filter.value?.toString());
                });
            };

            searchFilters.forEach(filterValues);
            filters.forEach(filterValues);

            this.total = this.filteredData.length;

            this.paginateData(this.filteredData, this.pageIndex, this.footer.pageSize);
        });

        this._grid.visibleColumnsToggle$
            .pipe(
                takeUntil(this._destroyed$),
            ).subscribe(opened => {
                this.visibleColumnsToggled.emit(opened);
            });
    }

    paginateData(data: MockData[], pageIndex: number, pageSize: number) {
        this.data$.next(data.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize));
    }

    generateButtons(length: number) {
        return new Array(length).fill(0);
    }

    onPageChange(event: PageChangeEvent) {
        this.pageIndex = event.pageIndex;
        this.paginateData(this.filteredData, event.pageIndex, event.pageSize);
    }

    getResults(searchTerm: string): Observable<ISuggestValues<any>> {
        const filteredData = this.allData.map(d => ({
            id: d.name,
            text: d.name,
            expandable: true,
        })).filter(a => a.text.includes(searchTerm.trim()));

        return of({
            total: filteredData.length,
            data: filteredData,
        });
    }

    searchSourceFactory: SearchSourceFactory = (searchTerm = '', top = 10, skip = 0) => of(searchTerm).pipe(
        switchMap(() => this.getResults(searchTerm)),
        tap((results: any) => console.log({
            searchTerm,
            top,
            skip,
            results,
        })),
        delay(50),
    );
}

type SearchSourceFactory = (searchTerm?: string, fetchCount?: number, skip?: number) => Observable<ISuggestValues<any>>;

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
    Subject,
} from 'rxjs';
import {
    startWith,
    takeUntil,
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
import { PageEvent } from '@angular/material/paginator';
import { UiGridComponent } from '@uipath/angular/components/ui-grid';

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

            searchFilters.forEach(filter => {
                this.filteredData = this.filteredData.filter((row: any) => row[filter.property].includes(filter.value));
            });

            filters.forEach(filter => {
                this.filteredData = this.filteredData.filter((row: any) => row[filter.property].includes(filter.value));
            });

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

    onPageChange(event: PageEvent) {
        this.pageIndex = event.pageIndex;
        this.paginateData(this.filteredData, event.pageIndex, event.pageSize);
    }
}

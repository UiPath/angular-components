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
import { startWith } from 'rxjs/operators';

import {
    AfterViewInit,
    Component,
    Input,
    OnDestroy,
    OnInit,
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
    public readonly inputs!: IInputs;

    @Input()
    public readonly header!: IHeader;

    @Input()
    public readonly footer!: IFooter;

    @Input()
    public allData!: MockData[];

    @Input()
    public readonly inputKeys!: string[];

    public pageSizes = [5, 10, 20];
    public pageIndex = 0;
    public data$ = new BehaviorSubject<MockData[]>([]);
    public filteredData: MockData[] = [];
    public total = 0;

    public editedEntity?: any;
    public editedIndex?: number;

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
        ]).subscribe(([searchFilters, filters]) => {
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
    }

    public paginateData(data: MockData[], pageIndex: number, pageSize: number) {
        this.data$.next(data.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize));
    }

    public generateButtons(length: number) {
        return new Array(length).fill(0);
    }

    public onPageChange(event: PageEvent) {
        this.pageIndex = event.pageIndex;
        this.paginateData(this.filteredData, event.pageIndex, event.pageSize);
    }
}

import {
    IFooter,
    IHeader,
    IInputs,
} from 'projects/playground/src/app/pages/grid/grid.models';
import {
    BehaviorSubject,
    of,
} from 'rxjs';
import { delay } from 'rxjs/operators';

import { Component } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    Validators,
} from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';

export interface MockData {
    id: number;
    name: string;
    parity: string;
}

@Component({
    selector: 'app-grid',
    templateUrl: './grid.page.html',
    styleUrls: ['./grid.page.scss'],
})
export class GridPageComponent {
    public allData: MockData[] = [];
    public data$ = new BehaviorSubject<MockData[]>([]);
    public lastPageChange?: PageEvent;
    public generatedGrid = false;

    public inputKeys = [
        'useLegacyDesign',
        'collapseFiltersCount',
        'loading',
        'isProjected',
        'disabled',
        'selectable',
        'toggleColumns',
        'multiPageSelect',
        'refreshable',
        'virtualScroll',
        'showPaintTime',
        'showHeaderRow',
    ];

    public buttonKeys = [
        'main',
        'action',
        'inline',
    ];

    public dataActions = [
        'totalData',
        'pageSize',
    ];

    public inputs?: IInputs;
    public header?: IHeader;
    public footer: IFooter = {
        total: 100,
        pageSize: 10,
        hidePageSize: false,
    };

    public actionsForm!: FormGroup;

    public constructor(
        private _fb: FormBuilder,
    ) {
        this.actionsForm = this._fb.group({
            inputs: this._fb.group({
                useLegacyDesign: [true],
                collapseFiltersCount: [20, [Validators.min(0), Validators.max(500)]],
                loading: [false],
                isProjected: [false],
                disabled: [false],
                selectable: [true],
                toggleColumns: [false],
                multiPageSelect: [false],
                refreshable: [true],
                virtualScroll: [false],
                showPaintTime: [false],
                showHeaderRow: [true],
            }),
            header: this._fb.group({
                searchable: [true],
                showFilter: [true],
                main: [0, [Validators.min(0), Validators.max(5)]],
                inline: [0, [Validators.min(0), Validators.max(5)]],
                action: [0, [Validators.min(0), Validators.max(5)]],
            }),
            data: this._fb.group({
                totalData: [this.footer.total, [Validators.min(0), Validators.max(1000)]],
                pageSize: [this.footer.pageSize, [Validators.min(0), Validators.max(1000)]],
            }),
        });
    }

    public generateData({ totalData, pageSize }: { totalData: number, pageSize: number }) {
        this.allData = new Array(totalData).fill(0).map((_, i) => ({
            id: i,
            name: `name-${i}`,
            parity: i % 2 === 0 ? 'even' : 'odd',
        }));
        this.footer.total = totalData;
        this.footer.pageSize = pageSize;
    }

    public generateGrid() {
        this.generatedGrid = false;

        if (this.actionsForm.invalid) { return; }

        this.inputs = this.actionsForm.get('inputs')!.value;
        this.header = this.actionsForm.get('header')!.value;
        this.generateData(this.actionsForm.get('data')!.value);

        of(0).pipe(
            delay(0),
        ).subscribe(() => {
            this.generatedGrid = true;
        });
    }
}

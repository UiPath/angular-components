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

// eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
@Component({
    selector: 'ui-app-grid',
    templateUrl: './grid.page.html',
    styleUrls: ['./grid.page.scss'],
})
export class GridPageComponent {
    allData: MockData[] = [];
    data$ = new BehaviorSubject<MockData[]>([]);
    lastPageChange?: PageEvent;
    generatedGrid = false;
    visibilityColumnsOpened = false;

    inputKeys = [
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

    buttonKeys = [
        'main',
        'action',
        'inline',
    ];

    dataActions = [
        'totalData',
        'pageSize',
    ];

    inputs?: IInputs;
    header?: IHeader;
    footer: IFooter = {
        total: 100,
        pageSize: 10,
        hidePageSize: false,
    };

    actionsForm!: FormGroup;

    constructor(
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

    generateData({ totalData, pageSize }: { totalData: number; pageSize: number }) {
        this.allData = new Array(totalData).fill(0).map((_, i) => ({
            id: i,
            name: `name-${i}`,
            parity: i % 2 === 0 ? 'even' : 'odd',
        }));
        this.footer.total = totalData;
        this.footer.pageSize = pageSize;
    }

    generateGrid() {
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

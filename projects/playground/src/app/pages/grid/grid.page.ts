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

import {
    AfterViewInit,
    Component,
} from '@angular/core';
import {
    UntypedFormBuilder,
    UntypedFormGroup,
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
export class GridPageComponent implements AfterViewInit {
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
        'customFilter',
        'useCardView',
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
        hideTotalCount: false,
    };

    actionsForm!: UntypedFormGroup;
    get inputGroup(): UntypedFormGroup {
        return this.actionsForm.get('inputs')! as UntypedFormGroup;
    }
    get headerGroup(): UntypedFormGroup {
        return this.actionsForm.get('header')! as UntypedFormGroup;
    }
    get footerGroup(): UntypedFormGroup {
        return this.actionsForm.get('footer')! as UntypedFormGroup;
    }
    get dataGroup(): UntypedFormGroup {
        return this.actionsForm.get('data')! as UntypedFormGroup;
    }

    constructor(
        private _fb: UntypedFormBuilder,
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
                customFilter: [false],
                useCardView: [true],
            }),
            header: this._fb.group({
                searchable: [true],
                showFilter: [true],
                main: [0, [Validators.min(0), Validators.max(5)]],
                inline: [0, [Validators.min(0), Validators.max(5)]],
                action: [0, [Validators.min(0), Validators.max(5)]],
            }),
            footer: this._fb.group({
                hideTotalCount: [false],
            }),
            data: this._fb.group({
                totalData: [this.footer.total, [Validators.min(0), Validators.max(1000)]],
                pageSize: [this.footer.pageSize, [Validators.min(0), Validators.max(1000)]],
            }),
        });
    }

    ngAfterViewInit(): void {
        this.generateGrid();
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
        this.footer.hideTotalCount = this.actionsForm.get('footer')!.value.hideTotalCount;
        this.generateData(this.actionsForm.get('data')!.value);

        of(0).pipe(
            delay(0),
        ).subscribe(() => {
            this.generatedGrid = true;
        });
    }
}

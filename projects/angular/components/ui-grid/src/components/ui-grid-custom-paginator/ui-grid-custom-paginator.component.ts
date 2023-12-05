import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    HostBinding,
    Inject,
    Injectable,
    Input,
    Optional,
    ViewEncapsulation,
} from '@angular/core';
import { MatFormFieldAppearance } from '@angular/material/form-field';
import {
    MatPaginatorDefaultOptions,
    MatPaginatorIntl,
    MAT_PAGINATOR_DEFAULT_OPTIONS,
    _MatPaginatorBase,
} from '@angular/material/paginator';

@Injectable()
export class UiMatPaginatorIntl extends MatPaginatorIntl {
    pageSelectLabel = 'Select page';

    getPageLabel(currentPage: number, pageCount?: number): string {
        if (!pageCount) {
            return `Page ${currentPage}`;
        }
        return `Page ${currentPage} / ${pageCount}`;
    }

    getPageOnlyLabel(): string {
        return 'Page';
    }

    getTotalPages(pageCount: number): string {
        return `/ ${pageCount}`;
    }
}

@Component({
    selector: 'ui-grid-custom-paginator',
    templateUrl: './ui-grid-custom-paginator.component.html',
    styleUrls: ['./ui-grid-custom-paginator.component.scss'],
    // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
    inputs: ['disabled'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class UiGridCustomPaginatorComponent extends _MatPaginatorBase<MatPaginatorDefaultOptions> {
    // eslint-disable-next-line
    public _formFieldAppearance?: MatFormFieldAppearance;
    // eslint-disable-next-line
    public _intl!: UiMatPaginatorIntl;

    /**
     * Whether to show total count in custom paginator
     *
     */
    @Input() hideTotalCount = false;

    /**
     * Whether to be able to select the page index
     */
    @Input() selectablePageIndex = false;

    @HostBinding('class')
    hostClass = 'mat-mdc-paginator';

    get pageCount(): number {
        return Math.ceil(this.length / this.pageSize);
    }

    get totalCount(): number {
        return Math.min(this.length, (this.pageIndex + 1) * this.pageSize);
    }

    set length(value: number) {
        super.length = value;

        this.possiblePages = Array.from({ length: this.pageCount }, (_, i) => ({
            label: i + 1,
            value: i,
        }));
    }
    get length() {
        return super.length;
    }

    possiblePages: { label: number; value: number }[] = [];

    constructor(
        changeDetectorRef: ChangeDetectorRef,
        @Optional()
        intl?: UiMatPaginatorIntl,
        @Optional()
        @Inject(MAT_PAGINATOR_DEFAULT_OPTIONS)
        defaults?: MatPaginatorDefaultOptions,
    ) {
        super(intl ?? new UiMatPaginatorIntl(), changeDetectorRef, defaults);

        if (defaults?.formFieldAppearance != null) {
            this._formFieldAppearance = defaults.formFieldAppearance;
        }
    }

    changePage(pageIndex: number) {
        const prevIndex = this.pageIndex;

        this.pageIndex = pageIndex;

        this.page.emit({
            pageIndex,
            previousPageIndex: prevIndex,
            pageSize: this.pageSize,
            length: this.length,
        });
    }
}

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
    getPageLabel(currentPage: number, pageCount?: number): string {
        if (!pageCount) {
            return `Page ${currentPage}`;
        }
        return `Page ${currentPage} / ${pageCount}`;
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
    @Input()
        hideTotalCount = false;

    @HostBinding('class')
    hostClass = 'mat-paginator';

    get pageCount(): number {
        return Math.ceil(this.length / this.pageSize);
    }

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
}

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

import { UiGridCustomPaginatorComponent } from './ui-grid-custom-paginator.component';

@NgModule({
    imports: [
        CommonModule,
        MatSelectModule,
        MatButtonModule,
        MatTooltipModule,
    ],
    declarations: [UiGridCustomPaginatorComponent],
    exports: [UiGridCustomPaginatorComponent],
})
export class UiGridCustomPaginatorModule { }

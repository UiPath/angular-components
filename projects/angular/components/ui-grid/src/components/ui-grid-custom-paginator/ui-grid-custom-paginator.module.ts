import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

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

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UiAutoAccessibleLabelModule } from '@uipath/angular/a11y';

import {
    UiGridToggleColumnsComponent,
} from './ui-grid-toggle-columns.component';

@NgModule({
    imports: [
        CommonModule,
        MatIconModule,
        MatSelectModule,
        MatButtonModule,
        MatTooltipModule,
        MatDividerModule,
        UiAutoAccessibleLabelModule,
    ],
    declarations: [UiGridToggleColumnsComponent],
    exports: [UiGridToggleColumnsComponent],
})
export class UiGridToggleColumnsModule { }

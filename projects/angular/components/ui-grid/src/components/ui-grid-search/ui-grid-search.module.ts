import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';

import { UiGridSearchComponent } from './ui-grid-search.component';

@NgModule({
    imports: [
        CommonModule,
        MatIconModule,
        MatFormFieldModule,
        MatButtonModule,
        MatInputModule,
        MatTooltipModule,
        ReactiveFormsModule,
    ],
    declarations: [UiGridSearchComponent],
    exports: [UiGridSearchComponent],
})
export class UiGridSearchModule { }

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
    MAT_SNACK_BAR_DEFAULT_OPTIONS,
    MatSnackBarModule,
} from '@angular/material/snack-bar';
import { UiPipeModule } from '@uipath/angular/pipes';

import { UiSnackBarComponent } from './ui-snackbar.component';

const DEFAULT_DURATION = 10000;
const DEFAULT_HORIZONTAL = 'center';
const DEFAULT_VERTICAL = 'top';

@NgModule({
    imports: [
        MatSnackBarModule,
        MatIconModule,
        MatButtonModule,
        UiPipeModule,
        CommonModule,
    ],
    entryComponents: [UiSnackBarComponent],
    declarations: [UiSnackBarComponent],
    providers: [{
        provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
        useValue: {
            verticalPosition: DEFAULT_VERTICAL,
            horizontalPosition: DEFAULT_HORIZONTAL,
            duration: DEFAULT_DURATION,
        },
    }],
})
export class UiSnackBarModule { }

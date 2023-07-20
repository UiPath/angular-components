import { UiSnackBarModule } from 'projects/angular/components/ui-snackbar/src/ui-snackbar.module';

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { SnackbarPageComponent } from './snackbar.page';

@NgModule({
    imports: [
        CommonModule,
        MatSnackBarModule,
        UiSnackBarModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
    ],
    declarations: [SnackbarPageComponent],
})
export class SnackbarModule { }

import { UiSnackBarModule } from 'projects/angular/components/ui-snackbar/src/ui-snackbar.module';

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';

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

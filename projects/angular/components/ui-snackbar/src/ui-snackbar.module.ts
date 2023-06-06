import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import {
    MatLegacySnackBarModule as MatSnackBarModule,
    MAT_LEGACY_SNACK_BAR_DEFAULT_OPTIONS as MAT_SNACK_BAR_DEFAULT_OPTIONS,
} from '@angular/material/legacy-snack-bar';
import { KeyboardShortcutModule } from '@uipath/angular/directives/keyboard-shortcut';
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
        PortalModule,
        UiPipeModule,
        CommonModule,
        KeyboardShortcutModule,
    ],
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

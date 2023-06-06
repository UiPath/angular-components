import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    Inject,
    NgModule,
} from '@angular/core';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { UI_MAT_SNACK_BAR_PAYLOAD } from 'projects/angular/components/ui-snackbar/src/public_api';

export type SnackbarContentPayload = {
    buttonLabel: string;
};

@Component({
    selector: 'ui-snackbar-content',
    template: `
    Snackbar w/ <b>Component</b>
    <button mat-flat-button style="margin-left: 5px;">{{payload.buttonLabel}}</button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SnackbarContentComponent {
    constructor(
        @Inject(UI_MAT_SNACK_BAR_PAYLOAD)
        public payload: SnackbarContentPayload,
    ) { }
}

@NgModule({
    imports: [
        CommonModule,
        MatButtonModule,
    ],
    declarations: [SnackbarContentComponent],
    exports: [SnackbarContentComponent],
})
export class SnackbarContentModule { }

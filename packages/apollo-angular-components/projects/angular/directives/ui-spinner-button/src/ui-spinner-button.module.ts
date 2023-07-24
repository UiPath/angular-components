import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';

import { UiButtonProgressSpinnerComponent } from './internal/ui-button-progress-spinner.component';
import { UiSpinnerButtonDirective } from './ui-spinner-button.directive';

@NgModule({
    imports: [
        CommonModule,
        MatProgressSpinnerModule,
    ],
    declarations: [
        UiButtonProgressSpinnerComponent,
        UiSpinnerButtonDirective,
    ],
    exports: [
        UiSpinnerButtonDirective,
    ],
})
export class UiSpinnerButtonModule { }

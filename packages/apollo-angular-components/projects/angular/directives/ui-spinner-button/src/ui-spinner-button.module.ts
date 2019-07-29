import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { UiButtonProgressSpinnerComponent } from './internal/ui-button-progress-spinner.component';
import { UiSpinnerButtonDirective } from './ui-spinner-button.directive';

@NgModule({
    imports: [
        CommonModule,
        MatProgressSpinnerModule,
    ],
    entryComponents: [UiButtonProgressSpinnerComponent],
    declarations: [
        UiButtonProgressSpinnerComponent,
        UiSpinnerButtonDirective,
    ],
    exports: [
        UiSpinnerButtonDirective,
    ],
})
export class UiSpinnerButtonModule { }

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { UiButtonProgressBarComponent } from './internal/ui-button-progress-bar.component';
import { UiProgressButtonDirective } from './ui-progress-button.directive';

@NgModule({
    imports: [
        CommonModule,
        MatProgressBarModule,
    ],
    entryComponents: [UiButtonProgressBarComponent],
    declarations: [
        UiButtonProgressBarComponent,
        UiProgressButtonDirective,
    ],
    exports: [
        UiProgressButtonDirective,
    ],
})
export class UiProgressButtonModule { }

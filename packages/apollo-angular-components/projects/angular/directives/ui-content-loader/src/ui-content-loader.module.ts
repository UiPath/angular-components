import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { UiContentSpinnerComponent } from './internal/ui-content-spinner.component';
import { UiContentLoaderDirective } from './ui-content-loader.directive';

@NgModule({
    imports: [
        CommonModule,
        MatProgressSpinnerModule,
    ],
    declarations: [
        UiContentLoaderDirective,
        UiContentSpinnerComponent,
    ],
    entryComponents: [
        UiContentSpinnerComponent,
    ],
    exports: [
        UiContentLoaderDirective,
    ],
})
export class UiContentLoaderModule { }

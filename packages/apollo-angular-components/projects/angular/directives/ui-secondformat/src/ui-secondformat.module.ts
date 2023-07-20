import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';

import { UiSecondFormatDirective } from './ui-secondformat.directive';

@NgModule({
    imports: [CommonModule, MatTooltipModule],
    declarations: [UiSecondFormatDirective],
    exports: [UiSecondFormatDirective],
})
export class UiSecondFormatModule { }

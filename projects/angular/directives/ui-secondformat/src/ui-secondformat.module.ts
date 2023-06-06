import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

import { UiSecondFormatDirective } from './ui-secondformat.directive';

@NgModule({
    imports: [CommonModule, MatTooltipModule],
    declarations: [UiSecondFormatDirective],
    exports: [UiSecondFormatDirective],
})
export class UiSecondFormatModule { }

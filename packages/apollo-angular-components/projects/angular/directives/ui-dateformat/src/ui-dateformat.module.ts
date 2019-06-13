import { NgModule } from '@angular/core';

import { UiDateFormatDirective } from './ui-dateformat.directive';

@NgModule({
    declarations: [UiDateFormatDirective],
    exports: [UiDateFormatDirective],
})
export class UiDateFormatModule { }

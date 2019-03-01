import { NgModule } from '@angular/core';

import { UiScrollIntoViewDirective } from './ui-scroll-into-view.directive';

@NgModule({
    declarations: [UiScrollIntoViewDirective],
    exports: [UiScrollIntoViewDirective],
})
export class UiScrollIntoViewModule { }

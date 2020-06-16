import { NgModule } from '@angular/core';

import { UiAutoAccessibleLabelDirective } from './ui-auto-accessible-label.directive';

@NgModule({
    declarations: [
        UiAutoAccessibleLabelDirective,
    ],
    exports: [
        UiAutoAccessibleLabelDirective,
    ],
})
export class UiAutoAccessibleLabelModule { }

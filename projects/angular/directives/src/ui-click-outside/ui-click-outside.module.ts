import { NgModule } from '@angular/core';

import { UiClickOutsideDirective } from './ui-click-outside.directive';

@NgModule({
    declarations: [UiClickOutsideDirective],
    exports: [UiClickOutsideDirective],
})
export class UiClickOutsideModule { }

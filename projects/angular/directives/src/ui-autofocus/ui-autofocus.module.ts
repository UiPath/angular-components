import { NgModule } from '@angular/core';

import { UiAutofocusDirective } from './ui-autofocus.directive';

@NgModule({
    declarations: [UiAutofocusDirective],
    exports: [UiAutofocusDirective],
})
export class UiAutofocusModule { }

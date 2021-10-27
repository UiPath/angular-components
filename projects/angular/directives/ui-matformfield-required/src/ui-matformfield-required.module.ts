import { NgModule } from '@angular/core';

import {
    UiMatFormFieldRequiredDirective,
} from './ui-matformfield-required.directive';

@NgModule({
    declarations: [UiMatFormFieldRequiredDirective],
    exports: [UiMatFormFieldRequiredDirective],
})
export class UiMatFormFieldRequiredModule {
}

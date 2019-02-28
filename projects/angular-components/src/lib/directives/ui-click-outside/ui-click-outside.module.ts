import {
  ModuleWithProviders,
  NgModule,
} from '@angular/core';

import {
  UiClickOutsideDirective,
  UiClickOutsideService,
} from './ui-click-outside.directive';

@NgModule({
    declarations: [UiClickOutsideDirective],
    exports: [UiClickOutsideDirective]
})
export class UiClickOutsideModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: UiClickOutsideModule,
            providers: [
                UiClickOutsideService
            ],
        };
    }
}

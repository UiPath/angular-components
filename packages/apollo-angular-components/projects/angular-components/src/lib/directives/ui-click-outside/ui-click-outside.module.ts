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
    static forRoot(): ModuleWithProviders<UiClickOutsideModule> {
        return {
            ngModule: UiClickOutsideModule,
            providers: [{
                provide: UiClickOutsideService,
                useClass: UiClickOutsideService,
            }],
        };
    }
}

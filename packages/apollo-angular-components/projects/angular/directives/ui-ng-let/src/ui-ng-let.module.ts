import { NgModule } from '@angular/core';

import { UiNgLetDirective } from './ui-ng-let.directive';

@NgModule({
    declarations: [UiNgLetDirective],
    exports: [UiNgLetDirective],
})
export class UiNgLetModule { }

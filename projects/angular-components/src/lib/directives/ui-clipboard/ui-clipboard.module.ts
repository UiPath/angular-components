import { NgModule } from '@angular/core';

import { UiClipboardDirective } from './ui-clipboard.directive';

@NgModule({
    declarations: [UiClipboardDirective],
    exports: [UiClipboardDirective],
})
export class UiClipboardModule { }

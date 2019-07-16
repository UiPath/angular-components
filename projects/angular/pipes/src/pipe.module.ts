import { NgModule } from '@angular/core';

import { UiNl2BrPipe } from './nl2br/nl2br.pipe';

const PIPES = [
    UiNl2BrPipe,
];

@NgModule({
    declarations: PIPES,
    exports: PIPES,
})
export class UiPipeModule { }

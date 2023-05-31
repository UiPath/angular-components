import { NgModule } from '@angular/core';

import { UiFileSizePipe } from './file-size/file-size.pipe';
import { UiNl2BrPipe } from './nl2br/nl2br.pipe';

const PIPES = [
    UiFileSizePipe,
    UiNl2BrPipe,
];

@NgModule({
    declarations: PIPES,
    exports: PIPES,
})
export class UiPipeModule { }

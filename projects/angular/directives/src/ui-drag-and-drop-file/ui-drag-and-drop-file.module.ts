import { NgModule } from '@angular/core';

import { UiDragAndDropFileDirective } from './ui-drag-and-drop-file.directive';

@NgModule({
    declarations: [UiDragAndDropFileDirective],
    exports: [UiDragAndDropFileDirective],
})
export class UiDragAndDropModule { }

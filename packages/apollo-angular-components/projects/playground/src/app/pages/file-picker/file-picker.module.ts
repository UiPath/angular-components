import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import {
    UiFilePickerComponent, UiInputFileDropZoneComponent,
} from '@uipath/angular/components/ui-file-picker';
import { UiFileDropZoneDirective } from '@uipath/angular/directives/ui-file-drop-zone';

import { FilePickerPageComponent } from './file-picker.page';

@NgModule({
  declarations: [
    FilePickerPageComponent,
  ],
  imports: [
    CommonModule,

    UiFileDropZoneDirective,
    UiFilePickerComponent,
    UiInputFileDropZoneComponent,
  ],
})
export class FilePickerModule { }

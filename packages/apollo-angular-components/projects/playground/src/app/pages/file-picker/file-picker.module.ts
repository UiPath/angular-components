import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FilePickerPageComponent } from 'projects/playground/src/app/pages/file-picker/file-picker.page';
import { UiFilePickerModule } from 'projects/angular/components/ui-file-picker/src/ui-file-picker.module';
import { PushModule } from '@ngrx/component';

@NgModule({
  declarations: [
    FilePickerPageComponent,
  ],
  imports: [
    CommonModule,
    UiFilePickerModule,
    PushModule,
  ],
})
export class FilePickerModule { }

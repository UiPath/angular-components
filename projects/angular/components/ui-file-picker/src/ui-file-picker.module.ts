import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import { UiGridModule } from '@uipath/angular/components/ui-grid';

import {
    LetModule,
    PushModule,
} from '@ngrx/component';
import { UiPipeModule } from '@uipath/angular/pipes';
import { UiFileDropZoneComponent } from './file-drop-zone/file-drop-zone.component';
import { UiFilePickerComponent } from './ui-file-picker.component';

@NgModule({
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatProgressSpinnerModule,
        MatTooltipModule,

        UiGridModule,
        UiPipeModule,

        LetModule,
        PushModule,
    ],
    declarations: [
        UiFileDropZoneComponent,
        UiFilePickerComponent,
    ],
    exports: [
        UiFileDropZoneComponent,
        UiFilePickerComponent,
    ],
})
export class UiFilePickerModule { }

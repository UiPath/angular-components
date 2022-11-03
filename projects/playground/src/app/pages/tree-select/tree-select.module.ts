import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { UiTreeSelectModule } from '@uipath/angular/components/ui-tree-select';

import { TreeSelectPageComponent } from './tree-select.page';

@NgModule({
  declarations: [
    TreeSelectPageComponent,
  ],
  imports: [
    CommonModule,
    UiTreeSelectModule,
    MatFormFieldModule,
  ],
})
export class TreeSelectModue { }

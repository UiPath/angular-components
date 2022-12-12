import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { UiTreeSelectComponent } from '@uipath/angular/components/ui-tree-select';
import { UiSpinnerButtonModule } from '@uipath/angular/directives/ui-spinner-button';

import { TreeSelectPageComponent } from './tree-select.page';

@NgModule({
  declarations: [
    TreeSelectPageComponent,
  ],
  imports: [
    CommonModule,
    UiTreeSelectComponent,
    MatFormFieldModule,
    MatIconModule,
    UiSpinnerButtonModule,
    MatButtonModule,
  ],
})
export class TreeSelectModue { }

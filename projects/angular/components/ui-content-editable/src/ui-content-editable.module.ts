import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
    FormsModule,
    ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UiAutoAccessibleLabelModule } from '@uipath/angular/a11y';
import { UiAutofocusModule } from '@uipath/angular/directives/ui-autofocus';

import { UiContentEditableComponent } from './ui-content-editable.component';

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    ReactiveFormsModule,
    UiAutofocusModule,
    FormsModule,
    MatTooltipModule,
    UiAutoAccessibleLabelModule,
  ],
  declarations: [UiContentEditableComponent],
  exports: [UiContentEditableComponent],
})
export class UiContentEditableModule { }

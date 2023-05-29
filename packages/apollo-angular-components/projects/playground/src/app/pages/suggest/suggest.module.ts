import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
  FormsModule, ReactiveFormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { UiSuggestModule } from '@uipath/angular/components/ui-suggest';
import { MatRadioModule } from '@angular/material/radio';

import { SuggestPageComponent } from './suggest.page';

@NgModule({
  declarations: [
    SuggestPageComponent,
  ],
  imports: [
    CommonModule,
    UiSuggestModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatRadioModule,
  ],
})
export class SuggestModule { }

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
  FormsModule, ReactiveFormsModule,
} from '@angular/forms';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { UiSuggestModule } from '@uipath/angular/components/ui-suggest';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';

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

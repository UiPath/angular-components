import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { UiSuggestModule } from '@uipath/angular/components/ui-suggest';

import { SuggestPageComponent } from './suggest.page';

@NgModule({
  declarations: [
    SuggestPageComponent,
  ],
  imports: [
    CommonModule,
    UiSuggestModule,
    MatFormFieldModule,
  ],
})
export class SuggestModule { }

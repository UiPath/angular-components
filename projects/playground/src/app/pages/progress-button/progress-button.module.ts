import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { UiProgressButtonModule } from '@uipath/angular/directives/ui-progress-button';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ProgressButtonPageComponent } from './progress-button.page';

@NgModule({
  declarations: [
    ProgressButtonPageComponent,
  ],
  imports: [
    CommonModule,
    UiProgressButtonModule,
    MatButtonModule,
    MatIconModule,
  ],
})
export class SuggestModule { }

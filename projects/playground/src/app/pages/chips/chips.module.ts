import {
    UiChipsModule,
} from 'projects/angular/components/ui-chips/src/ui-chips.module';

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ChipsPageComponent } from './chips.page';

@NgModule({
  declarations: [
    ChipsPageComponent,
  ],
  imports: [
    CommonModule,
    UiChipsModule,
  ],
})
export class ChipsModule { }

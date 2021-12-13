import {
    UiAutocompleteModule,
} from 'projects/angular/components/ui-chips/src/ui-autocomplete/ui-autocomplete.module';

import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { UiChipsComponent } from './ui-chips.component';

@NgModule({
  declarations: [
    UiChipsComponent,
  ],
  exports: [
    UiChipsComponent,
  ],
  imports: [
    CommonModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    ScrollingModule,
    UiAutocompleteModule,
  ],
})
export class UiChipsModule { }

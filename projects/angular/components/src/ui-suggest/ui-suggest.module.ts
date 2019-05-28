import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  UiAutofocusModule,
  UiClickOutsideModule,
  UiNgLetModule,
  UiVirtualScrollRangeLoaderModule,
} from '@uipath/angular/directives';

import { UiSuggestComponent } from './ui-suggest.component';

@NgModule({
    imports: [
        CommonModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatTooltipModule,
        MatCheckboxModule,
        ScrollingModule,
        MatRippleModule,
        ReactiveFormsModule,
        UiNgLetModule,
        UiAutofocusModule,
        UiClickOutsideModule,
        UiVirtualScrollRangeLoaderModule,
    ],
    declarations: [
        UiSuggestComponent,
    ],
    exports: [
        UiSuggestComponent,
    ],
})
export class UiSuggestModule { }

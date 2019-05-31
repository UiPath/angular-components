import { ScrollingModule as XScrollingModule } from '@angular/cdk-experimental/scrolling';
import { A11yModule } from '@angular/cdk/a11y';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UiVirtualScrollViewportResizeModule } from '@uipath/angular/directives';

import { UiSuggestModule } from '../ui-suggest/ui-suggest.module';
import {
  UiGridColumnDirective,
  UiGridExpandedRowDirective,
  UiGridRowActionDirective,
  UiGridRowConfigDirective,
} from './body';
import { UiGridSearchModule } from './components';
import {
  UiGridDropdownFilterDirective,
  UiGridSearchFilterDirective,
} from './filters';
import { UiGridFooterDirective } from './footer';
import {
  UiGridHeaderButtonDirective,
  UiGridHeaderDirective,
} from './header';
import { UiGridComponent } from './ui-grid.component';

@NgModule({
  imports: [
    CommonModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatProgressBarModule,
    ScrollingModule,
    XScrollingModule,
    UiGridSearchModule,
    UiSuggestModule,
    A11yModule,
    UiVirtualScrollViewportResizeModule,
  ],
  declarations: [
    UiGridComponent,
    UiGridRowActionDirective,
    UiGridColumnDirective,
    UiGridHeaderDirective,
    UiGridHeaderButtonDirective,
    UiGridFooterDirective,
    UiGridSearchFilterDirective,
    UiGridDropdownFilterDirective,
    UiGridRowConfigDirective,
    UiGridExpandedRowDirective,
  ],
  exports: [
    UiGridComponent,
    UiGridRowActionDirective,
    UiGridColumnDirective,
    UiGridHeaderDirective,
    UiGridHeaderButtonDirective,
    UiGridFooterDirective,
    UiGridSearchFilterDirective,
    UiGridDropdownFilterDirective,
    UiGridRowConfigDirective,
    UiGridExpandedRowDirective,
  ],
})
export class UiGridModule { }

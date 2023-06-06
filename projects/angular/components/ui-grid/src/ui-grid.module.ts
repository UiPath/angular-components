import { A11yModule } from '@angular/cdk/a11y';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';
import { MatLegacyProgressBarModule as MatProgressBarModule } from '@angular/material/legacy-progress-bar';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { UiAutoAccessibleLabelModule } from '@uipath/angular/a11y';
import { UiSuggestModule } from '@uipath/angular/components/ui-suggest';
import { UiCustomMatMenuTriggerModule } from '@uipath/angular/directives/custom-mat-menu-trigger';
import { UiNgLetModule } from '@uipath/angular/directives/ui-ng-let';
import { UiVirtualScrollViewportResizeModule } from '@uipath/angular/directives/ui-virtual-scroll-viewport-resize';

import { UiGridColumnDirective } from './body/ui-grid-column.directive';
import { UiGridExpandedRowDirective } from './body/ui-grid-expanded-row.directive';
import { UiGridLoadingDirective } from './body/ui-grid-loading.directive';
import { UiGridNoContentDirective } from './body/ui-grid-no-content.directive';
import { UiGridRowActionDirective } from './body/ui-grid-row-action.directive';
import { UiGridRowCardViewDirective } from './body/ui-grid-row-card-view.directive';
import { UiGridRowConfigDirective } from './body/ui-grid-row-config.directive';
import { UiGridCustomPaginatorModule } from './components/ui-grid-custom-paginator/ui-grid-custom-paginator.module';
import { UiGridSearchModule } from './components/ui-grid-search/ui-grid-search.module';
import { UiGridToggleColumnsModule } from './components/ui-grid-toggle-columns/ui-grid-toggle-columns.module';
import { UiGridDropdownFilterDirective } from './filters/ui-grid-dropdown-filter.directive';
import { UiGridSearchFilterDirective } from './filters/ui-grid-search-filter.directive';
import { UiGridFooterDirective } from './footer/ui-grid-footer.directive';
import { UiGridHeaderButtonDirective } from './header/ui-grid-header-button.directive';
import { UiGridHeaderDirective } from './header/ui-grid-header.directive';
import { UiGridComponent } from './ui-grid.component';

@NgModule({
    imports: [
        CommonModule,
        MatPaginatorModule,
        MatCheckboxModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatSelectModule,
        MatTooltipModule,
        MatProgressBarModule,
        MatRadioModule,
        ScrollingModule,
        UiGridSearchModule,
        UiGridToggleColumnsModule,
        UiGridCustomPaginatorModule,
        UiSuggestModule,
        A11yModule,
        UiVirtualScrollViewportResizeModule,
        UiAutoAccessibleLabelModule,
        UiNgLetModule,
        UiCustomMatMenuTriggerModule,
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
        UiGridNoContentDirective,
        UiGridLoadingDirective,
        UiGridRowCardViewDirective,
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
        UiGridNoContentDirective,
        UiGridLoadingDirective,
        UiGridRowCardViewDirective,
    ],
})
export class UiGridModule { }

import { NgModule } from '@angular/core';
import { CdkTreeModule } from '@angular/cdk/tree';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { UiSpinnerButtonModule } from '@uipath/angular/directives/ui-spinner-button';
import { MatListModule } from '@angular/material/list';
import { UiContentLoaderModule } from '@uipath/angular/directives/ui-content-loader';
import { UiTreeSelectComponent } from './ui-tree-select.component';
import { UiTreeItemModule } from './ui-tree-item/ui-tree-item.module';

@NgModule({
    declarations: [
        UiTreeSelectComponent,
    ],
    imports: [
        CommonModule,
        MatListModule,

        UiSpinnerButtonModule,
        UiTreeItemModule,
        UiContentLoaderModule,

        CdkTreeModule,
        ScrollingModule,
    ],
    exports: [
        UiTreeSelectComponent,
    ],
})
export class UiTreeSelectModule {}

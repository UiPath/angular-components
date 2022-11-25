import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UiSpinnerButtonModule } from '@uipath/angular/directives/ui-spinner-button';
import { UiTreeItemComponent } from './ui-tree-item.component';

@NgModule({
    declarations: [
        UiTreeItemComponent,
    ],
    imports: [
        CommonModule,
        MatListModule,
        MatButtonModule,
        MatIconModule,
        UiSpinnerButtonModule,
    ],
    exports: [
        UiTreeItemComponent,
    ],
})
export class UiTreeItemModule {}

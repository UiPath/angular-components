import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UiAutoAccessibleLabelModule } from '@uipath/angular/a11y';
import { UiNgLetModule } from '@uipath/angular/directives/ui-ng-let';

import { UiPasswordToggleComponent } from './ui-password-toggle.component';

@NgModule({
    imports: [
        CommonModule,
        MatTooltipModule,
        MatIconModule,
        MatButtonModule,
        UiAutoAccessibleLabelModule,
        UiNgLetModule,
    ],
    declarations: [
        UiPasswordToggleComponent,
    ],
    exports: [
        UiPasswordToggleComponent,
    ],
})
export class UiPasswordToggleModule { }

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
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

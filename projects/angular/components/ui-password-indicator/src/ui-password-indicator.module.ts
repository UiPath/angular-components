import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacyProgressBarModule as MatProgressBarModule } from '@angular/material/legacy-progress-bar';
import { UiNgLetModule } from '@uipath/angular/directives/ui-ng-let';

import { UiPasswordIndicatorComponent } from './ui-password-indicator.component';

@NgModule({
    imports: [
        CommonModule,
        MatListModule,
        MatProgressBarModule,
        MatIconModule,
        UiNgLetModule,
    ],
    declarations: [
        UiPasswordIndicatorComponent,
    ],
    exports: [
        UiPasswordIndicatorComponent,
    ],
})
export class UiPasswordIndicatorModule { }

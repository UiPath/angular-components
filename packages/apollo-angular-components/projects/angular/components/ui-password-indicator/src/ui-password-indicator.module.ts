import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
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

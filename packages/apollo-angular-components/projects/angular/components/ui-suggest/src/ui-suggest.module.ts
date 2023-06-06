import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { UiAutoAccessibleLabelModule } from '@uipath/angular/a11y';
import { UiAutofocusModule } from '@uipath/angular/directives/ui-autofocus';
import { UiClickOutsideModule } from '@uipath/angular/directives/ui-click-outside';
import { UiNgLetModule } from '@uipath/angular/directives/ui-ng-let';
import { UiVirtualScrollRangeLoaderModule } from '@uipath/angular/directives/ui-virtual-scroll-range-loader';
import { OverlayModule } from '@angular/cdk/overlay';

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
        MatProgressSpinnerModule,
        ReactiveFormsModule,
        UiNgLetModule,
        UiAutofocusModule,
        UiClickOutsideModule,
        UiVirtualScrollRangeLoaderModule,
        MatChipsModule,
        UiAutoAccessibleLabelModule,
        OverlayModule,
    ],
    declarations: [
        UiSuggestComponent,
    ],
    exports: [
        UiSuggestComponent,
    ],
})
export class UiSuggestModule { }

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UiNgLetModule } from '@uipath/angular/directives/ui-ng-let';
import { UiVirtualScrollRangeLoaderModule } from '@uipath/angular/directives/ui-virtual-scroll-range-loader';
import { UiAutocompleteComponent } from 'projects/angular/components/ui-autocomplete/src/ui-autocomplete.component';

@NgModule({
    imports: [
        CommonModule,
        MatIconModule,
        MatListModule,
        MatInputModule,
        MatCheckboxModule,
        MatTooltipModule,
        MatProgressSpinnerModule,
        UiNgLetModule,
        UiVirtualScrollRangeLoaderModule,
    ],
    declarations: [
        UiAutocompleteComponent,
    ],
    exports: [
        UiAutocompleteComponent,
    ],
})
export class UiAutocompleteModule {

}

import {
    UiAutocompleteComponent,
} from 'projects/angular/components/ui-chips/src/ui-autocomplete/ui-autocomplete.component';

import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

const EXPORTS = [
    UiAutocompleteComponent,
    // UiAutocomopleteDataSourceDirective,
];

@NgModule({
    imports: [
        CommonModule,
        ScrollingModule,
    ],
    declarations: [
        ...EXPORTS,
    ],
    exports: [
        EXPORTS,
    ],
})
export class UiAutocompleteModule { }

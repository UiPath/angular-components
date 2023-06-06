import { GridComponent } from 'projects/playground/src/app/pages/grid/component/grid.component';
import { UiGridTable } from 'projects/playground/src/app/pages/grid/grid.intl';

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
    FormsModule,
    ReactiveFormsModule,
} from '@angular/forms';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
    UiGridIntl,
    UiGridModule,
} from '@uipath/angular/components/ui-grid';

import { GridPageComponent } from './grid.page';

@NgModule({
    declarations: [
        GridPageComponent,
        GridComponent,
    ],
    imports: [
        CommonModule,
        BrowserModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        FormsModule,
        UiGridModule,
        MatCardModule,
        MatCheckboxModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
    ],
    providers: [{
        provide: UiGridIntl,
        useClass: UiGridTable,
    }],
})
export class GridModule { }

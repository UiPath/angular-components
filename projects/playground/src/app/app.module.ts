import { GridModule } from 'projects/playground/src/app/pages/grid/grid.page.module';
import { HomeModule } from 'projects/playground/src/app/pages/home/home.page.module';
import { SnackbarModule } from 'projects/playground/src/app/pages/snackbar/snackbar.module';

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
    declarations: [
        AppComponent,
    ],
    imports: [
        AppRoutingModule,
        CommonModule,
        BrowserModule,
        BrowserAnimationsModule,
        GridModule,
        HomeModule,
        SnackbarModule,
        MatSidenavModule,
        MatButtonModule,
        MatIconModule,
        MatToolbarModule,
    ],
    bootstrap: [AppComponent],
})
export class AppModule { }

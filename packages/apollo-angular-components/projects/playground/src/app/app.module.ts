import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SnackbarModule } from './pages/snackbar/snackbar.module';
import { HomeModule } from './pages/home/home.page.module';
import { GridModule } from './pages/grid/grid.page.module';

import { FilePickerModule } from './pages/file-picker/file-picker.module';
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
        FilePickerModule,
        MatSidenavModule,
        MatButtonModule,
        MatIconModule,
        MatToolbarModule,
    ],
    bootstrap: [AppComponent],
})
export class AppModule { }

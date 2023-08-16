import { GridPageComponent } from 'projects/playground/src/app/pages/grid/grid.page';
import { HomePageComponent } from 'projects/playground/src/app/pages/home/home.page';
import { SnackbarPageComponent } from 'projects/playground/src/app/pages/snackbar/snackbar.page';
import { SuggestPageComponent } from 'projects/playground/src/app/pages/suggest/suggest.page';

import { NgModule } from '@angular/core';
import {
    RouterModule,
    Routes,
} from '@angular/router';
import { TreeSelectPageComponent } from 'projects/playground/src/app/pages/tree-select/tree-select.page';
import { ProgressButtonPageComponent } from 'projects/playground/src/app/pages/progress-button/progress-button.page';

const routes: Routes = [
    {
        path: 'home',
        component: HomePageComponent,
    },
    {
        path: 'grid',
        component: GridPageComponent,
    },
    {
        path: 'snackbar',
        component: SnackbarPageComponent,
    },
    {
        path: 'suggest',
        component: SuggestPageComponent,
    },
    {
        path: 'tree',
        component: TreeSelectPageComponent,
    },
    {
        path: 'progress-button',
        component: ProgressButtonPageComponent,
    },
    {
        path: '**',
        redirectTo: 'home',
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule { }

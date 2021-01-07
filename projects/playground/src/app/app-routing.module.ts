import { GridPage } from 'projects/playground/src/app/pages/grid/grid.page';
import { HomePage } from 'projects/playground/src/app/pages/home/home.page';

import { NgModule } from '@angular/core';
import {
    RouterModule,
    Routes,
} from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    component: HomePage,
  },
  {
    path: 'grid',
    component: GridPage,
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

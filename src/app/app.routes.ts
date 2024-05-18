import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./demo/demo.module').then(m => m.DemoModule),
  }
];

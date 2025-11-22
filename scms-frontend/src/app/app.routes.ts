import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { ServiceListComponent } from './pages/service-list/service-list.component';
import { ContractListComponent } from './pages/contract-list/contract-list.component';
import { MainPageComponent } from './pages/main-page/main-page.component';

export const routes: Routes = [
  { path: '', redirectTo: 'main-page', pathMatch: 'full' },
  {
    path: 'main-page',
    component: MainPageComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: LoginComponent },
      { path: 'service-list', component: ServiceListComponent },
      { path: 'contract-list', component: ContractListComponent },
    ],
  },
  { path: '**', redirectTo: 'main-page' },
];

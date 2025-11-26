import { Router, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { ServiceListComponent } from './pages/service-list/service-list.component';
import { ContractListComponent } from './pages/contract-list/contract-list.component';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { AuthService } from './bff/auth/auth.service';
import { inject } from '@angular/core';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'main-page',
    component: MainPageComponent,
    children: [
      { path: 'service-list', component: ServiceListComponent },
      { path: 'contract-list', component: ContractListComponent },
      { path: '', redirectTo: 'service-list', pathMatch: 'full' },
    ],
    // MainPageComponentにはログインが必要
    canActivate: [() => inject(AuthService).isLoggedIn() ? true : inject(Router).createUrlTree(['/login'])],
  },
  { path: '**', redirectTo: 'login' },
];

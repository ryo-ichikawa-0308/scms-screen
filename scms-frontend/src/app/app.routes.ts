import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { ServiceListComponent } from './pages/service-list/service-list.component';
import { ContractListComponent } from './pages/contract-list/contract-list.component';
import { ContractDetailComponent } from './pages/contract-detail/contract-detail.component';
import { ServiceDetailComponent } from './pages/service-detail/service-detail.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: '/service-list', component: ServiceListComponent },
  //  { path: '/service-detail', component: ServiceDetailComponent },
  //  { path: '/contract-list', component: ContractListComponent },
  //  { path: '/contract-detail', component: ContractDetailComponent },
  { path: '**', redirectTo: '' },
];

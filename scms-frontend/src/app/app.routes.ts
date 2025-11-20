import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
//import { ContractListComponent } from './pages/contract-list/contract-list.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },

  //{ path: 'contracts', component: ContractListComponent },

  // { path: '**', redirectTo: '' }
];

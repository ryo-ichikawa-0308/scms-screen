import { Component, inject } from '@angular/core';

import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from 'src/app/bff/auth/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, MatToolbarModule, MatButtonModule, 
    MatIconModule, MatSidenavModule, MatListModule, RouterModule
],
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
  authService = inject(AuthService);
  router = inject(Router);

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

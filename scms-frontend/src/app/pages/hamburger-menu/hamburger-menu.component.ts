import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from 'src/app/bff/auth/auth.service';

@Component({
  selector: 'app-hamburger-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, MatSidenavModule, MatListModule, MatButtonModule, MatIconModule],
  templateUrl: './hamburger-menu.component.html',
  styleUrls: ['./hamburger-menu.component.scss']
})
export class HamburgerMenuComponent {
  isLoggedIn = inject(AuthService).isLoggedIn;
  authService = inject(AuthService);
  router = inject(Router);

  logout(): void {
    this.authService.logout();
    // ログアウト後の遷移は AuthService 内で実施されるが、明示的に記述しても良い
  }
}
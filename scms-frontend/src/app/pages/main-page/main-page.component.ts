import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { FooterComponent } from 'src/app/components/footer/footer.component';
import { HamburgerMenuComponent } from 'src/app/components/hamburger-menu/hamburger-menu.component';
import { MenuItem } from 'src/app/models/hamburger-menu.model';
import { AuthService } from 'src/app/core/auth/auth.service';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent, HamburgerMenuComponent],
  templateUrl: './main-page.html',
  styleUrls: ['./main-page.scss'],
})
export class MainPageComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  // ヘッダーのタイトル
  headerTitle = signal('アプリケーション ホーム');

  // ログイン状態
  isLoggedIn = computed(() => this.authService.isLoggedIn());
  // ログアウトアクション
  private logoutAction = () => {
    // ログアウト処理を実行し、ログイン画面へ遷移
    this.authService.logout();
    void this.router.navigate(['/']);
    console.log('ユーザーがログアウトしました。');
  };

  // リンク設定の定義
  private serviceLinkConfig: MenuItem = {
    label: 'サービス一覧',
    iconKey: 'service',
    action: () => {
      void this.router.navigate(['/service-list']);
    },
  };

  private contractLinkConfig: MenuItem = {
    label: '契約一覧',
    iconKey: 'contract',
    action: () => {
      void this.router.navigate(['/contract-list']);
    },
  };

  // メニュー項目のリスト: isLoggedIn の値に基づいて自動的にメニュー内容が決定される computed シグナル
  menuItems = computed<MenuItem[]>(() => {
    if (this.isLoggedIn()) {
      return [
        this.serviceLinkConfig,
        this.contractLinkConfig,
        {
          label: 'ログアウト',
          iconKey: 'logout',
          action: this.logoutAction,
        },
      ];
    }
    // ログアウト状態ではメニュー項目は不要
    return [];
  });

  constructor() {}

  /**
   * ヘッダータイトルを更新するメソッド
   * @param newTitle 新しいタイトル
   */
  updateHeaderTitle(newTitle: string): void {
    this.headerTitle.set(newTitle);
  }
}

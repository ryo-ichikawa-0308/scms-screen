import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; // ルーティングのために必要
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

  // ログイン状態 (モック。実際には認証サービスから取得)
  isLoggedIn = signal(true);

  // ハンバーガーメニュー設定

  // ログアウトアクション
  private logoutAction = () => {
    // ログアウト処理を実行し、ログイン画面へ遷移
    this.authService.logout(); // 仮のログアウトメソッド
    void this.router.navigate(['/login']);
    console.log('ユーザーがログアウトしました。');
  };

  // サービス一覧へのリンク設定
  serviceLinkConfig: MenuItem = {
    label: 'サービス一覧',
    iconKey: 'service',
    action: () => {
      void this.router.navigate(['/service-list']);
    },
  };

  // 契約一覧へのリンク設定
  contractLinkConfig: MenuItem = {
    label: '契約一覧',
    iconKey: 'contract',
    action: () => {
      void this.router.navigate(['/contract-list']);
    },
  };

  // メニュー項目のリスト
  menuItems = signal<MenuItem[]>([]);

  constructor() {
    // ログイン状態に応じてメニュー項目を設定
    if (this.isLoggedIn()) {
      this.menuItems.set([
        this.serviceLinkConfig,
        this.contractLinkConfig,
        {
          label: 'ログアウト',
          iconKey: 'contract',
          action: this.logoutAction,
        },
      ]);
    }
  }

  /**
   * ヘッダータイトルを更新するメソッド
   * @param newTitle 新しいタイトル
   */
  updateHeaderTitle(newTitle: string): void {
    this.headerTitle.set(newTitle);
  }
}

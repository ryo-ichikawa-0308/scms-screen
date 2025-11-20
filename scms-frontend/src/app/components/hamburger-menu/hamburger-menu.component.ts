import { Component, Input, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
// 新しい設定ファイルから MenuItem 型と MENU_ICONS をインポート
import { MenuItem, MENU_ICONS } from '../../core/models/hamburger-menu.model';

// 以前の MenuItem 定義は削除されました

@Component({
  selector: 'app-hamburger-menu',
  standalone: true,
  imports: [CommonModule],
  // ChangeDetectionStrategy.OnPush を設定し、パフォーマンスを最適化
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './hamburger-menu.component.html', // テンプレートファイルを指定
  styleUrls: ['./hamburger-menu.component.scss'], // スタイルファイルを指定
})
export class HamburgerMenuComponent {
  // テンプレートで利用できるように MENU_ICONS をプロパティとして公開
  readonly menuIcons = MENU_ICONS;

  // 外部から渡されるログイン状態
  @Input({ required: true }) isLoggedIn = signal(false);

  // 外部から渡されるメニューデータ
  @Input({ required: true }) serviceLink!: MenuItem;
  @Input({ required: true }) contractLink!: MenuItem;

  // 内部状態: メニューの開閉状態 (Signal)
  readonly isMenuOpen = signal(false);

  // Computed Signal: 渡されたリンク情報をメニュー項目の配列として統合
  // item.iconKey が定義されたため、ここではロジックを簡素化
  readonly menuItems = computed(() => [this.serviceLink, this.contractLink]);

  constructor() {}

  /**
   * メニューの開閉状態を切り替える
   */
  toggleMenu(): void {
    this.isMenuOpen.update((value) => !value);
  }

  /**
   * メニューを閉じる
   */
  closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  /**
   * 選択されたメニュー項目のアクションを実行し、メニューを閉じる
   * @param action 実行する関数
   */
  executeAction(action: () => void): void {
    // 実行前にメニューを閉じる
    this.closeMenu();
    // 外部から渡された関数を実行
    action();
  }
}

import { Component, Input, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuItem, MENU_ICONS } from 'src/app/models/hamburger-menu.model';
@Component({
  selector: 'app-hamburger-menu',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './hamburger-menu.component.html', // テンプレートファイルを指定
  styleUrls: ['./hamburger-menu.component.scss'], // スタイルファイルを指定
})
export class HamburgerMenuComponent {
  readonly menuIcons = MENU_ICONS;

  @Input({ required: true }) isLoggedIn!: boolean;
  @Input({ required: true }) menuItems!: MenuItem[];

  readonly isMenuOpen = signal(false);

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

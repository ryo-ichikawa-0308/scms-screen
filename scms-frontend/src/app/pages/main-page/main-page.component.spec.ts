// main-page.component.spec.ts

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainPageComponent } from './main-page.component';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/bff/auth/auth.service';
import { By } from '@angular/platform-browser';

// -------------------------------------------------------------------------
// モックの定義
// -------------------------------------------------------------------------

// AuthServiceのモック
const mockAuthService = {
  logout: jasmine.createSpy('logout'),
};

// Routerのモック
const mockRouter = {
  navigate: jasmine.createSpy('navigate'),
};

// -------------------------------------------------------------------------
// テストスイート
// -------------------------------------------------------------------------

describe('MainPageComponent', () => {
  let component: MainPageComponent;
  let fixture: ComponentFixture<MainPageComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // Standalone Component のため imports に直接指定
      // MatSidenavなどのアニメーションモジュールが必要
      imports: [MainPageComponent],
      providers: [
        // 依存オブジェクトをモックで提供
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MainPageComponent);
    component = fixture.componentInstance;
    
    // Spyの取得（型を明確にするため）
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // 初期化
    fixture.detectChanges();
  });

  // -------------------------------------------------------------------------
  // 1. 初期化のテスト
  // -------------------------------------------------------------------------
  it('✅ コンポーネントが正常に作成されること', () => {
    expect(component).toBeTruthy();
  });

  // -------------------------------------------------------------------------
  // 2. ログアウト処理のテスト
  // -------------------------------------------------------------------------
  describe('logout', () => {
    it('✅ logout() が呼ばれたとき、AuthService.logout() が呼ばれること', () => {
      component.logout();
      // ログアウトAPI (AuthService内の処理) が呼ばれていることを確認
      expect(authService.logout).toHaveBeenCalledTimes(1);
    });

    it('✅ logout() が呼ばれたとき、ログイン画面へ遷移すること', () => {
      component.logout();
      // Router.navigate が '/login' で呼ばれていることを確認
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  // -------------------------------------------------------------------------
  // 3. テンプレートとの連携テスト
  // -------------------------------------------------------------------------
  it('✅ ツールバーのログアウトボタンがクリックされたとき、logout() メソッドが呼ばれること', () => {
    // コンポーネントの logout メソッドを Spy に置き換える
    spyOn(component, 'logout');
    
    // テンプレート内のログアウトボタン要素を検索
    const logoutButton = fixture.debugElement.query(By.css('mat-toolbar button:last-child'));
    
    // ボタンが存在することを確認
    expect(logoutButton).toBeTruthy();
    
    // ボタンをクリック
    logoutButton.triggerEventHandler('click', null);
    fixture.detectChanges();

    // コンポーネントの logout メソッドが呼ばれたことを確認
    expect(component.logout).toHaveBeenCalledTimes(1);
  });
});
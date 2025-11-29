
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/bff/auth/auth.service';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

// -------------------------------------------------------------------------
// モックの定義
// -------------------------------------------------------------------------

// AuthServiceのモック
const mockAuthService = {
  login: jasmine.createSpy('login'),
};

// Routerのモック
const mockRouter = {
  navigate: jasmine.createSpy('navigate'),
};

// -------------------------------------------------------------------------
// テストスイート
// -------------------------------------------------------------------------

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // Standalone Component のため imports に直接指定
      // FormsModule もインポートして ngModel の動作を可能にする
      imports: [LoginComponent, FormsModule],
      providers: [
        // 依存オブジェクトをモックで提供
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
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

  it('✅ 初期状態でフォーム入力値とエラーメッセージが空であること', () => {
    expect(component.email).toBe('');
    expect(component.password).toBe('');
    expect(component.errorMessage).toBeNull();
    expect(component.isLoading).toBeFalse();
  });

  // -------------------------------------------------------------------------
  // 2. バリデーションのテスト (簡易バリデーション)
  // -------------------------------------------------------------------------
  it('⚠️ ユーザーIDが空の場合、エラーメッセージが表示され、ログインAPIが呼ばれないこと', () => {
    component.email = '';
    component.password = 'validPassword';

    component.handleLogin();

    // 検証
    expect(authService.login).not.toHaveBeenCalled();
    expect(component.errorMessage).toBe('ユーザーIDとパスワードを入力してください。');
    expect(component.isError).toBeTrue();
    expect(component.isLoading).toBeFalse();
  });

  it('⚠️ パスワードが空の場合、エラーメッセージが表示され、ログインAPIが呼ばれないこと', () => {
    component.email = 'test@example.com';
    component.password = '';

    component.handleLogin();

    // 検証
    expect(authService.login).not.toHaveBeenCalled();
    expect(component.errorMessage).toBe('ユーザーIDとパスワードを入力してください。');
    expect(component.isError).toBeTrue();
    expect(component.isLoading).toBeFalse();
  });

  // -------------------------------------------------------------------------
  // 3. ログイン処理のテスト (handleLogin)
  // -------------------------------------------------------------------------
  const VALID_EMAIL = 'user@example.com';
  const VALID_PASSWORD = 'password123';
  const LOGIN_SUCCESS_ROUTE = ['/main-page/service-list'];

  beforeEach(() => {
    // 有効な入力値を設定
    component.email = VALID_EMAIL;
    component.password = VALID_PASSWORD;
  });

  // -------------------------------------------------------------------------
  // 3.1. 正常系
  // -------------------------------------------------------------------------
  it('✅ ログイン成功時、ローディングが解除され、サービス一覧画面へ遷移すること', fakeAsync(() => {
    // 成功するObservableを設定
    authService.login.and.returnValue(of({id:'', name:'',token:{accessToken:'', expiresIn:0}})); 
    
    component.handleLogin();

    // 検証: API呼び出し
    expect(component.isLoading).toBeTrue(); // API呼び出し直後
    expect(authService.login).toHaveBeenCalledWith({ 
      email: VALID_EMAIL, 
      password: VALID_PASSWORD 
    });

    tick(); // APIの処理を完了させる (next: 実行)

    // 検証: 遷移と状態変化
    expect(router.navigate).toHaveBeenCalledWith(LOGIN_SUCCESS_ROUTE);
    expect(component.isLoading).toBeFalse();
    expect(component.errorMessage).toBeNull();
  }));

  // -------------------------------------------------------------------------
  // 3.2. 異常系
  // -------------------------------------------------------------------------
  it('❌ ログインAPIが401エラーを返した場合、エラーメッセージが表示され、遷移しないこと', fakeAsync(() => {
    const errorResponse = new HttpErrorResponse({
      status: 401,
      statusText: 'Unauthorized',
      error: { message: '認証情報が不正です' }
    });
    // 失敗するObservableを設定
    authService.login.and.returnValue(throwError(() => errorResponse));
    
    component.handleLogin();

    // 検証: API呼び出し
    expect(component.isLoading).toBeTrue(); 

    tick(); // APIの処理を完了させる (error: 実行)

    // 検証: 状態変化と遷移しないこと
    expect(router.navigate).not.toHaveBeenCalled();
    expect(component.isLoading).toBeFalse();
    expect(component.errorMessage).toBe('認証情報が不正です。メールアドレスとパスワードを確認してください。');
    expect(component.isError).toBeTrue();
  }));
  
  it('❌ ログインAPIが500エラーを返した場合、一般エラーメッセージが表示され、遷移しないこと', fakeAsync(() => {
    const errorResponse = new HttpErrorResponse({
      status: 500,
      statusText: 'Internal Server Error',
      error: { message: 'サーバーでエラーが発生しました' }
    });
    // 失敗するObservableを設定
    authService.login.and.returnValue(throwError(() => errorResponse));
    
    component.handleLogin();

    // 検証: API呼び出し
    expect(component.isLoading).toBeTrue(); 

    tick(); // APIの処理を完了させる (error: 実行)

    // 検証: 状態変化と遷移しないこと
    expect(router.navigate).not.toHaveBeenCalled();
    expect(component.isLoading).toBeFalse();
    expect(component.errorMessage).toBe('ログイン処理中に予期せぬエラーが発生しました。時間をおいて再度お試しください。');
    expect(component.isError).toBeTrue();
  }));
});
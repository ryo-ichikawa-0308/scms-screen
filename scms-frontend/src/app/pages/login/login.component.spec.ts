
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/bff/auth/auth.service';
import { delay, of, switchMap, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

// AuthServiceのモック
const mockAuthService = {
  login: jasmine.createSpy('login'),
};

// Routerのモック
const mockRouter = {
  navigate: jasmine.createSpy('navigate'),
};

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent, FormsModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture.detectChanges();
  });
  afterEach(() => {
    mockAuthService.login.calls.reset();
    mockRouter.navigate.calls.reset();
  });
  describe('init', () => {
    it('✅ コンポーネントが正常に作成されること', () => {
      expect(component).toBeTruthy();
    });
    it('✅ 初期状態でフォーム入力値とエラーメッセージが空であること', () => {
      expect(component.email).toBe('');
      expect(component.password).toBe('');
      expect(component.errorMessage).toBeNull();
      expect(component.isLoading).toBeFalse();
    });
  });
  // -------------------------------------------------------------------------
  // 2. バリデーションのテスト (簡易バリデーション)
  // -------------------------------------------------------------------------
  describe('バリデーション', () => {
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
  });
  describe('handleLogin', () => {
    const VALID_EMAIL = 'user@example.com';
    const VALID_PASSWORD = 'password123';
    const LOGIN_SUCCESS_ROUTE = ['/main-page/service-list'];

    beforeEach(() => {
      // 有効な入力値を設定
      component.email = VALID_EMAIL;
      component.password = VALID_PASSWORD;
    });
    describe('正常系', () => {
      it('✅ ログイン成功時、ローディングが解除され、サービス一覧画面へ遷移すること', fakeAsync(() => {
        authService.login.and.returnValue(of({ id: '', name: '', token: { accessToken: '', expiresIn: 0 } }).pipe(delay(0)));
        component.handleLogin();
        expect(component.isLoading).toBeTrue();
        expect(authService.login).toHaveBeenCalledWith({
          email: VALID_EMAIL,
          password: VALID_PASSWORD
        });
        tick();

        expect(router.navigate).toHaveBeenCalledWith(LOGIN_SUCCESS_ROUTE);
        expect(component.isLoading).toBeFalse();
        expect(component.errorMessage).toBeNull();
      }));
    });
    describe('異常系', () => {
      it('❌ ログインAPIが401エラーを返した場合、エラーメッセージが表示され、遷移しないこと', fakeAsync(() => {
        const errorResponse = new HttpErrorResponse({
          status: 401,
          statusText: 'Unauthorized',
          error: { message: '認証情報が不正です' }
        });
        authService.login.and.returnValue(of(null).pipe(
          delay(10),
          switchMap(() => throwError(() => errorResponse))
        ));
        component.handleLogin();
        expect(component.isLoading).toBeTrue();
        tick(10);
        expect(router.navigate).not.toHaveBeenCalled();
        expect(component.isLoading).toBeFalse();
        expect(component.errorMessage).toBe('認証情報が不正です');
        expect(component.isError).toBeTrue();
      }));

      it('❌ ログインAPIが500エラーを返した場合、一般エラーメッセージが表示され、遷移しないこと', fakeAsync(() => {
        const errorResponse = new HttpErrorResponse({
          status: 500,
          statusText: 'Internal Server Error',
          error: { message: 'サーバーでエラーが発生しました' }
        });
        authService.login.and.returnValue(of(null).pipe(
          delay(10),
          switchMap(() => throwError(() => errorResponse))
        ));

        component.handleLogin();
        expect(component.isLoading).toBeTrue();
        tick(10);

        expect(router.navigate).not.toHaveBeenCalled();
        expect(component.isLoading).toBeFalse();
        expect(component.errorMessage).toBe('サーバーでエラーが発生しました');
        expect(component.isError).toBeTrue();
      }));
    });
  });
});
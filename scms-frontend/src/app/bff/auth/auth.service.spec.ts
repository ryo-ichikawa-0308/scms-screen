import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { CookieService } from 'ngx-cookie-service';
import { AUTH_ENDPOINTS } from '../constants/constants';
import { LoginRequest, LoginResponse, AccessToken, RefreshResponse } from 'src/app/models/api.model';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let cookieService: CookieService;

  const LOGIN_URL = AUTH_ENDPOINTS.LOGIN;
  const REFRESH_URL = AUTH_ENDPOINTS.REFRESH_TOKEN;
  const MOCK_LOGIN_RESPONSE: LoginResponse = {
    id: 'user123',
    name: 'Test User',
    token: { accessToken: 'mock_access_token', expiresIn: 3600 },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        AuthService,
        {
          provide: CookieService,
          useValue: {
            get: jasmine.createSpy('get'),
            set: jasmine.createSpy('set'),
            delete: jasmine.createSpy('delete'),
          },
        },
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    cookieService = TestBed.inject(CookieService);
    spyOn(sessionStorage, 'setItem');
    spyOn(sessionStorage, 'getItem').and.returnValue(null);
    spyOn(sessionStorage, 'removeItem');
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('login', () => {
    const loginRequest: LoginRequest = { email: 'test@example.com', password: 'password' };
    describe('正常系', () => {
      it('API成功時、アクセストークンとID情報が保存され、isLoggedInシグナルがtrueになる', (done) => {
        service.login(loginRequest).subscribe(() => {
          expect(service.isLoggedIn()).toBeTrue();
          expect(sessionStorage.setItem).toHaveBeenCalled();
          done();
        });

        const req = httpMock.expectOne(LOGIN_URL);
        expect(req.request.method).toBe('POST');
        req.flush(MOCK_LOGIN_RESPONSE);
      });
    });
    describe('異常系', () => {
      it('API失敗時、エラーがthrowされ、isLoggedInシグナルはfalseのまま', (done) => {
        service.login(loginRequest).subscribe({
          next: () => fail('ログインは失敗するべきです'),
          error: (err) => {
            expect(err instanceof HttpErrorResponse).toBeTrue();
            expect(service.isLoggedIn()).toBeFalse();
            expect(sessionStorage.setItem).not.toHaveBeenCalled();
            done();
          },
        });

        const req = httpMock.expectOne(LOGIN_URL);
        req.flush('認証失敗', { status: 401, statusText: 'Unauthorized' });
      });
    });
  });
  describe('refreshToken', () => {
    const MOCK_REFRESH_TOKEN = 'mock_refresh_token_from_cookie';
    const MOCK_NEW_TOKEN: RefreshResponse = { token: { accessToken: 'new_token_123', expiresIn: 3600 } };
    describe('正常系', () => {
      it('リフレッシュトークンが有効な場合、新しいアクセストークンを取得・保存する', (done) => {
        service.refreshToken().subscribe((res) => {
          expect(res).toEqual(MOCK_NEW_TOKEN);
          expect(sessionStorage.setItem).toHaveBeenCalled();
          done();
        });

        const req = httpMock.expectOne(REFRESH_URL);
        expect(req.request.method).toBe('POST');
        expect(req.request.headers.get('Authorization')).toBe(`Bearer ${MOCK_REFRESH_TOKEN}`);
        req.flush(MOCK_NEW_TOKEN);
      });
    });
    describe('異常系', () => {
      it('リフレッシュAPIが失敗した場合、ログアウト処理が呼ばれる', (done) => {
        spyOn(service, 'logout');

        service.refreshToken().subscribe({
          next: () => fail('リフレッシュは失敗するべきです'),
          error: () => {
            expect(service.logout).toHaveBeenCalled();
            done();
          },
        });

        // 検証: API呼び出し（400 Bad Request）
        const req = httpMock.expectOne(REFRESH_URL);
        req.flush('リフレッシュ失敗', { status: 400, statusText: 'Bad Request' });
      });
    });
  });
  describe('logout', () => {
    it('ログアウト時、セッションストレージのトークンが削除される', () => {
      (service as any)._isLoggedIn.set(true);
      service.logout();
      expect(sessionStorage.removeItem).toHaveBeenCalledTimes(2);
      expect(service.isLoggedIn()).toBeFalse();
    });
  });
});

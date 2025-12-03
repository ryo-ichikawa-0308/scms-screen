import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { RefreshResponse } from 'src/app/models/api.model';

const mockAuthService = {
  getAccessToken: jasmine.createSpy('getAccessToken').and.returnValue('valid_token'),
  logout: jasmine.createSpy('logout'),
  getIsRefreshing: jasmine.createSpy('getIsRefreshing').and.returnValue(false),
  isAccessTokenExpired: jasmine.createSpy('isAccessTokenExpired').and.returnValue(false),
  refreshToken: jasmine.createSpy('refreshToken'),
  getRefreshTokenSubject: jasmine.createSpy('getRefreshTokenSubject').and.returnValue(new Subject<string>()),
};

const mockRouter = {
  navigate: jasmine.createSpy('navigate'),
};

describe('AuthInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let authService: typeof mockAuthService;
  let router: typeof mockRouter;

  const MOCK_TOKEN = 'valid_token';
  const REFRESH_TOKEN_RESPONSE: RefreshResponse = {
    token: { accessToken: 'new_token', expiresIn: 3600 },
  };
  const TEST_URL = '/test-api';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
    authService = TestBed.inject(AuthService) as unknown as typeof mockAuthService; 
    router = TestBed.inject(Router) as unknown as typeof mockRouter; 

    mockAuthService.getAccessToken.and.returnValue(MOCK_TOKEN);
    mockAuthService.getIsRefreshing.and.returnValue(false);
    mockAuthService.isAccessTokenExpired.and.returnValue(false);
    mockAuthService.logout.calls.reset();
    mockAuthService.refreshToken.calls.reset();
    mockRouter.navigate.calls.reset();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('有効なトークンをヘッダーに付与し、APIリクエストが成功すること', (done) => {
    httpClient.get(TEST_URL).subscribe((res) => {
      expect(res).toBeTruthy();
      done();
    });
    
    const req = httpMock.expectOne(TEST_URL);
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${MOCK_TOKEN}`);
    req.flush({ data: 'ok' });
  });

  describe('401エラーからのリフレッシュ', () => {
    it('401エラーを受け取るとリフレッシュを実行し、元のリクエストを新しいトークンで再試行する', (done) => {
      authService.isAccessTokenExpired.and.returnValue(true);
      authService.refreshToken.and.returnValue(of(REFRESH_TOKEN_RESPONSE));

      httpClient.get(TEST_URL).subscribe(
        (res) => {
          expect(res).toEqual({ data: 'retry_ok' });
          expect(authService.refreshToken).toHaveBeenCalledTimes(1);
          done();
        },
        () => fail('リクエストが失敗しました'),
      );

      // 1. 最初のHTTPリクエスト (401を返す)
      let initialReq = httpMock.expectOne(TEST_URL);
      expect(initialReq.request.headers.get('Authorization')).toBe(`Bearer ${MOCK_TOKEN}`);
      initialReq.flush(null, { status: 401, statusText: 'Unauthorized' });

      // 2. リフレッシュ成功後の再試行されたHTTPリクエスト (新しいトークンを検証)
      let retryReq = httpMock.expectOne(TEST_URL);
      expect(retryReq.request.headers.get('Authorization')).toBe(
        `Bearer ${REFRESH_TOKEN_RESPONSE.token.accessToken}`,
      );
      retryReq.flush({ data: 'retry_ok' });
    });

    it('401エラーを受け取り、リフレッシュに失敗するとログアウト処理を行う', (done) => {
      authService.isAccessTokenExpired.and.returnValue(true);
      authService.refreshToken.and.returnValue(
        throwError(() => new HttpErrorResponse({ status: 400 })),
      );
      httpClient.get(TEST_URL).subscribe({
        next: () => fail('リクエストは失敗するべきです'),
        error: (error) => {
          expect(authService.refreshToken).toHaveBeenCalledTimes(1);
          expect(authService.logout).toHaveBeenCalled();
          expect(router.navigate).toHaveBeenCalledWith(['/login']);
          done();
        },
      });
      // 最初のHTTPリクエスト (401を返す)
      let initialReq = httpMock.expectOne(TEST_URL);
      initialReq.flush(null, { status: 401, statusText: 'Unauthorized' });
    });
  });
});
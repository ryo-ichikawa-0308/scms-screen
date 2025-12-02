import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import {
  HTTP_INTERCEPTORS,
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
} from '@angular/common/http';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { RefreshResponse } from 'src/app/models/api.model';

describe('AuthInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let authService: AuthService;
  let router: Router;

  const MOCK_TOKEN = 'valid_token';
  const REFRESH_TOKEN_RESPONSE: RefreshResponse = {
    token: { accessToken: 'new_token', expiresIn: 3600 },
  };
  const TEST_URL = '/test-api';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        AuthService,
        {
          provide: HTTP_INTERCEPTORS,
          useValue: authInterceptor,
          multi: true,
        },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);

    spyOn(authService, 'getAccessToken').and.returnValue(MOCK_TOKEN);
    spyOn(authService, 'logout');
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('authInterceptor', () => {
    describe('正常系', () => {
      it('有効なトークンをヘッダーに付与し、APIリクエストが成功すること', (done) => {
        authService.getAccessToken = jasmine.createSpy().and.returnValue(MOCK_TOKEN);
        httpClient.get(TEST_URL).subscribe((res) => {
          expect(res).toBeTruthy();
          done();
        });
        const req = httpMock.expectOne(TEST_URL);
        expect(req.request.headers.get('Authorization')).toBe(`Bearer ${MOCK_TOKEN}`);
        req.flush({ data: 'ok' });

        describe('401エラーからのリフレッシュ', () => {
          it('401エラーを受け取るとリフレッシュを実行し、元のリクエストを新しいトークンで再試行する', (done) => {
            authService.getAccessToken = jasmine.createSpy().and.returnValue(MOCK_TOKEN);
            spyOn(authService, 'isAccessTokenExpired').and.returnValue(true);
            const refreshTokenSpy = spyOn(authService, 'refreshToken').and.returnValue(
              of(REFRESH_TOKEN_RESPONSE),
            );

            httpClient.get(TEST_URL).subscribe(
              (res) => {
                expect(res).toEqual({ data: 'retry_ok' }); // 再試行リクエストの応答
                expect(refreshTokenSpy).toHaveBeenCalledTimes(1); // リフレッシュが1回呼び出されたこと
                done();
              },
              () => fail('リクエストが失敗しました'),
            );

            // 1. 最初のHTTPリクエスト (401を返す)
            let initialReq = httpMock.expectOne(TEST_URL);
            initialReq.flush(null, { status: 401, statusText: 'Unauthorized' });

            // 2. 再試行されたHTTPリクエスト (新しいトークンを検証)
            let retryReq = httpMock.expectOne(TEST_URL);
            expect(retryReq.request.headers.get('Authorization')).toBe(
              `Bearer ${REFRESH_TOKEN_RESPONSE.token.accessToken}`,
            );
            retryReq.flush({ data: 'retry_ok' }); // 成功レスポンス
          });
        });
      });
    });
    describe('異常系', () => {
      it('401エラーを受け取り、リフレッシュに失敗するとログアウト処理を行う', (done) => {
        authService.getAccessToken = jasmine.createSpy().and.returnValue(MOCK_TOKEN);
        spyOn(authService, 'isAccessTokenExpired').and.returnValue(true);
        spyOn(authService, 'refreshToken').and.returnValue(
          throwError(() => new HttpErrorResponse({ status: 400 })),
        );

        httpClient.get(TEST_URL).subscribe({
          next: () => fail('リクエストは失敗するべきです'),
          error: (error) => {
            // 検証: ログアウトと遷移
            expect(authService.logout).toHaveBeenCalled();
            expect(router.navigate).toHaveBeenCalledWith(['/login']);
            done();
          },
        });
        let initialReq = httpMock.expectOne(TEST_URL);
        initialReq.flush(null, { status: 401, statusText: 'Unauthorized' });
      });
    });
  });


});

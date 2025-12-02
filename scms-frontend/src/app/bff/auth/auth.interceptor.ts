import { HttpErrorResponse, HttpEvent, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { throwError } from 'rxjs/internal/observable/throwError';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

/**
 * アクセストークンをリクエストヘッダーに付与する処理
 * @param req 元のHttpRequest
 * @param token 付与するアクセストークン
 * @returns トークンが付与された新しいHttpRequest
 */
function addToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * リクエスト実行前処理。アクセストークンの有効性チェックとリフレッシュを行う。
 * @param req 元のHttpRequest
 * @param next HttpHandlerの次の処理
 * @returns HttpEventのObservable
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getAccessToken();

  // 1. トークン付与
  if (token) {
    req = addToken(req, token);
  }

  // 2. リクエストの実行とエラーハンドリング
  return next(req).pipe(
    catchError((error: HttpErrorResponse): Observable<HttpEvent<unknown>> => {
      const token = authService.getAccessToken();
      // 401 Unauthorized エラーを捕捉 (トークンが無効または期限切れの場合)
      if (error.status === 401 && token) {
        // A. リフレッシュ中でない かつ ローカルで期限切れの場合 -> リフレッシュ開始
        if (!authService.getIsRefreshing() && authService.isAccessTokenExpired()) {
          return authService.refreshToken().pipe(
            switchMap((response) => {
              console.log('更新したアクセストークンでAPIリトライします。');
              return next(addToken(req, response.token.accessToken));
            }),
            catchError((refreshError: HttpErrorResponse) => {
              authService.logout();
              void router.navigate(['/login']);
              return throwError(() => refreshError);
            }),
          );
        }

        // B. リフレッシュ中の場合 -> Subject から新しいトークンが来るまで待機
        else if (authService.getIsRefreshing()) {
          return authService.getRefreshTokenSubject().pipe(
            filter((token) => token !== null),
            take(1),
            switchMap((newToken) => {
              return next(addToken(req, newToken));
            }),
          );
        }
      }

      // 401以外のエラー、またはトークンが存在しない場合
      return throwError(() => error);
    }),
  );
};

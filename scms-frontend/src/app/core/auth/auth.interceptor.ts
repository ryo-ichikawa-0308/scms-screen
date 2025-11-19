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
            // リフレッシュが完了し、新しいトークンが取得されるのを待機 (Subjectから通知を受ける)
            // SubjectはrefreshToken()内で既にnext(null)されているため、
            // 成功時の next(newToken) が来るのを待ちます。
            switchMap((response) => {
              // 新しいトークンで元のリクエストを再試行
              return next(addToken(req, response.accessToken));
            }),
            catchError((refreshError) => {
              // リフレッシュ失敗 -> ログアウト
              router.navigate(['/login']);
              return throwError(() => refreshError);
            })
          );
        }

        // B. リフレッシュ中の場合 -> Subject から新しいトークンが来るまで待機
        else if (authService.getIsRefreshing()) {
          return authService.getRefreshTokenSubject().pipe(
            // Subjectに値が流れるのを待ち、nullでない(トークンが来たら)フィルタリング
            filter((token) => token !== null),
            // 一度だけ値を取得したら、ストリームを完了
            take(1),
            // 新しいトークンで元のリクエストを再試行
            switchMap((newToken) => {
              return next(addToken(req, newToken!));
            })
          );
        }
      }

      // 401以外のエラー、またはトークンが存在しない場合
      return throwError(() => error);
    })
  );
};

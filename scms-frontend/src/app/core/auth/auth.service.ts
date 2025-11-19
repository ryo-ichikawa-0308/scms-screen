import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { ACCESS_TOKEN_EXPIRES_KEY, ACCESS_TOKEN_KEY, AUTH_ENDPOINTS } from '../constants/constants';

// ログインAPIのレスポンスの型を定義

interface AccessToken {
  accessToken: string;
  expiresIn: number;
}
interface LoginResponse {
  id: string;
  name: string;
  token: AccessToken;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly LOGIN_URL = AUTH_ENDPOINTS.LOGIN;
  private readonly REFRESH_URL = AUTH_ENDPOINTS.REFRESH_TOKEN;
  private readonly ACCESS_TOKEN_KEY = ACCESS_TOKEN_KEY;
  private readonly ACCESS_TOKEN_EXPIRES_KEY = ACCESS_TOKEN_EXPIRES_KEY;

  // リフレッシュ処理の状態管理 (多重リフレッシュを防ぐため)
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(
    null
  );

  constructor(private http: HttpClient) {}

  /**
   * ログインAPIを呼び出し、成功した場合はトークンを保存する
   * @param credentials ユーザーIDとパスワードを含むオブジェクト
   */
  login(credentials: { email: string; password: string }): Observable<LoginResponse> {
    // ログインAPIをPOSTで呼び出す
    return this.http.post<LoginResponse>(this.LOGIN_URL, credentials).pipe(
      tap((response) => {
        // ログイン成功時

        // 1. アクセストークンをセッションストレージに保存
        this.saveAccessToken(response.token);

        // 2. リフレッシュトークンはサーバー側が設定したHTTP-Only Cookieで返されることを想定し、
        //    フロントエンドでは自動的にブラウザが保存するため、ここでは特別な処理は不要。
      })
    );
  }

  // アクセストークンの保存処理
  private saveAccessToken(token: AccessToken): void {
    const accessTokenExpires = new Date().getTime() + token.expiresIn;
    sessionStorage.setItem(this.ACCESS_TOKEN_KEY, token.accessToken);
    sessionStorage.setItem(this.ACCESS_TOKEN_EXPIRES_KEY, accessTokenExpires.toString());
    console.log('アクセストークンをセッションストレージに保存しました。');
  }

  /**
   * セッションストレージからアクセストークンを取得する (APIリクエストヘッダ付与用)
   */
  getAccessToken(): string | null {
    return sessionStorage.getItem(this.ACCESS_TOKEN_KEY);
  }
  /**
   * アクセストークンが有効期限切れかどうかをチェックする
   */
  isAccessTokenExpired(): boolean {
    const expires = sessionStorage.getItem(this.ACCESS_TOKEN_EXPIRES_KEY);
    if (!expires) {
      return true; // 有効期限情報がない場合は期限切れと見なす
    }
    const expiresTime = parseInt(expires, 10);
    const now = new Date().getTime();

    // 有効期限 <= 現在日時 の場合、期限切れ
    return expiresTime <= now;
  }
  /**
   * トークンリフレッシュAPIを呼び出す
   */
  refreshToken(): Observable<AccessToken> {
    // 多重呼び出し防止と Subject の利用
    if (this.isRefreshing) {
      // リフレッシュ中の場合は、Subject が発火するまで待機
      // (この処理はインターセプター側で行います)
      return throwError(() => new Error('Token refresh already in progress.'));
    }

    this.isRefreshing = true;
    // Subjectを初期化 (nullにしておき、新しいトークンが来たら流す)
    this.refreshTokenSubject.next(null);

    return this.http.post<AccessToken>(AUTH_ENDPOINTS.REFRESH_TOKEN, {}).pipe(
      tap((response) => {
        // 成功時
        this.saveAccessToken(response);

        // リフレッシュ完了を通知し、新しいトークンを流す
        this.isRefreshing = false;
        this.refreshTokenSubject.next(response.accessToken);
      }),
      catchError((err) => {
        // 失敗時
        this.isRefreshing = false;
        this.refreshTokenSubject.next(null); // 通知をリセット
        // this.logout(); // 強制ログアウト
        return throwError(() => err);
      })
    );
  }

  // Subject を外部に公開するゲッター
  getRefreshTokenSubject(): BehaviorSubject<string | null> {
    return this.refreshTokenSubject;
  }

  getIsRefreshing(): boolean {
    return this.isRefreshing;
  }
}

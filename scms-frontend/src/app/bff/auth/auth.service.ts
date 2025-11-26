import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import {
  ACCESS_TOKEN_EXPIRES_KEY,
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  AUTH_ENDPOINTS,
} from 'src/app/bff/constants/constants';
import { AccessToken, LoginRequest, LoginResponse } from 'src/app/models/api.model';
import { CookieService } from 'ngx-cookie-service';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly LOGIN_URL = AUTH_ENDPOINTS.LOGIN;
  private readonly REFRESH_URL = AUTH_ENDPOINTS.REFRESH_TOKEN;
  private readonly ACCESS_TOKEN_KEY = ACCESS_TOKEN_KEY;
  private readonly ACCESS_TOKEN_EXPIRES_KEY = ACCESS_TOKEN_EXPIRES_KEY;
  private readonly REFRESH_TOKEN_KEY = REFRESH_TOKEN_KEY;

  // リフレッシュ処理の状態管理 (多重リフレッシュを防ぐため)
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(
    null
  );
  private readonly REFRESH_TOKEN = 'refresh_token';

  // 認証状態を管理するためのWritableSignal
  private _isLoggedIn = signal<boolean>(this.checkInitialSession());

  // 外部から参照するためのRead-only Signal
  public isLoggedIn = computed(() => this._isLoggedIn());

  constructor(private http: HttpClient, private cookieService: CookieService) { }

  // 初期セッションチェックロジック（ローカルストレージを確認）
  private checkInitialSession(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  /**
   * 認証状態のシグナルを更新します。
   * MainPageComponent はこの変更を自動的に検知します。
   * @param status ログイン状態
   */
  setLoggedIn(status: boolean): void {
    this._isLoggedIn.set(status);
  }

  /**
   * ログインAPIを呼び出し、成功した場合はトークンを保存する
   * @param credentials ユーザーIDとパスワードを含むオブジェクト
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    // ログインAPIをPOSTで呼び出す
    return this.http.post<LoginResponse>(this.LOGIN_URL, credentials).pipe(
      tap((response) => {
        // アクセストークンをセッションストレージに保存
        this.saveAccessToken(response.token);
        this._isLoggedIn.set(true);
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
    // 1. Cookieからリフレッシュトークンを取得
    const refreshToken = this.cookieService.get(this.REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      console.warn('リフレッシュトークンがCookieに見つかりません。強制ログアウトします。');
      this.logout();
      return throwError(() => new Error('リフレッシュトークンが見つからないため強制ログアウト'));
    }

    // 多重呼び出し防止と Subject の利用
    if (this.isRefreshing) {
      // リフレッシュ中の場合は、Subject が発火するまで待機
      return throwError(() => new Error('リフレッシュ実行中です。'));
    }

    this.isRefreshing = true;
    this.refreshTokenSubject.next(null);

// 2. リフレッシュトークンをヘッダーに設定
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${refreshToken}`, 
  });
  
  return this.http.post<AccessToken>(this.REFRESH_URL, {}).pipe(
      tap((response) => {
        // 成功時
        this.saveAccessToken(response);
        this.isRefreshing = false;
        this.refreshTokenSubject.next(response.accessToken);
      }),
      catchError((err: HttpErrorResponse) => {
        // 失敗時
        this.isRefreshing = false;
        this.refreshTokenSubject.next(null);
        this.logout();
        return throwError(() => err);
      })
    );
  }

  /**
   * アクセストークンとリフレッシュトークンを削除し、ログアウトする。
   */
  logout() {
    sessionStorage.removeItem(this.ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(this.ACCESS_TOKEN_EXPIRES_KEY);
    this.cookieService.delete(this.REFRESH_TOKEN);
    console.log('アクセストークンとリフレッシュトークンを削除しました。');
  }

  /**
   * Subject を外部に公開するゲッター
   * @returns リフレッシュトークンのサブジェクト
   */
  getRefreshTokenSubject(): BehaviorSubject<string | null> {
    return this.refreshTokenSubject;
  }

  /**
   * トークンリフレッシュ中の検出
   * @returns トークンリフレッシュが実行中であればtrue
   */
  getIsRefreshing(): boolean {
    return this.isRefreshing;
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import {
  ACCESS_TOKEN_EXPIRES_KEY,
  ACCESS_TOKEN_KEY,
  AUTH_ENDPOINTS,
} from 'src/app/core/constants/constants';
import { AccessToken, LoginRequest, LoginResponse } from 'src/app/models/auth.model';
import { CookieService } from 'ngx-cookie-service';
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
    null,
  );
  private readonly REFRESH_TOKEN = 'refresh_token';

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
  ) {}

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
      }),
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
      catchError((err: Observable<AccessToken>) => {
        // 失敗時
        this.isRefreshing = false;
        this.refreshTokenSubject.next(null); // 通知をリセット
        this.logout(); // 強制ログアウト
        return throwError(() => err);
      }),
    );
  }

  /**
   * アクセストークンとリフレッシュトークンを無効化する
   */
  logout() {
    throw new Error('Method not implemented.');
  }

  // Subject を外部に公開するゲッター
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

  /**
   * ユーザーが認証可能（セッションが有効）かどうかを判断します。
   * アクセストークンまたはリフレッシュトークンのいずれかが有効であれば true を返します。
   * * @returns 認証可能であれば true、完全にセッションが切れていれば false
   */
  public isSessionValid(): boolean {
    // 1 & 2. isAccessTokenExpired()の戻り値がfalseの場合、trueを返す。
    if (!this.isAccessTokenExpired()) {
      return true;
    }

    // 3. isAccessTokenExpired()の戻り値がtrueの場合、Cookieからリフレッシュトークンの期限を取得する。
    const refreshExpiryTimeMs = this.getRefreshTokenExpiration();

    // 5. リフレッシュトークンが取得できない場合、falseを返す。
    if (refreshExpiryTimeMs === null) {
      return false;
    }

    // 現在時刻 (ミリ秒)
    const currentTimeMs = Date.now();

    // 4. リフレッシュトークンの期限が現在時刻より未来の場合、trueを返す。
    if (refreshExpiryTimeMs > currentTimeMs) {
      // 注意: この場合、アクセストークンは期限切れなので、後続の処理でトークンのリフレッシュが必要です。
      return true;
    }

    // 5. リフレッシュトークンの期限が現在時刻より過去の場合、falseを返す。
    return false;
  }
  /**
   * Cookieからリフレッシュトークンの有効期限を取得する
   * @returns 有効期限のUnixタイムスタンプ (ミリ秒単位) または null
   */
  private getRefreshTokenExpiration(): number | null {
    try {

      const cookieString = this.cookieService.get(this.REFRESH_TOKEN); 
      if (!cookieString) {
        return null;
      }
      const payload = JSON.parse(cookieString);

      if (typeof payload.expires === 'number') {
        return payload.expires * 1000; 
      }
      
      console.warn('リフレッシュトークンのCookieにexpiresキーが見つかりません。:', payload);
      return null;

    } catch (error) {
      console.error('Cookie文字列のJSONパースに失敗:', error);
      return null;
    }
  }
}

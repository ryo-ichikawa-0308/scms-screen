import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ACCESS_TOKEN_EXPIRES_KEY, ACCESS_TOKEN_KEY, AUTH_ENDPOINTS } from '../constants/constants';
import { dateTimestampProvider } from 'rxjs/internal/scheduler/dateTimestampProvider';

// ログインAPIのレスポンスの型を定義
interface LoginResponse {
  id: string;
  name: string;
  token: {
    accessToken: string;
    expiresIn: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly LOGIN_URL = AUTH_ENDPOINTS.LOGIN;
  private readonly ACCESS_TOKEN_KEY = ACCESS_TOKEN_KEY;
  private readonly ACCESS_TOKEN_EXPIRES_KEY = ACCESS_TOKEN_EXPIRES_KEY;

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
        this.saveAccessToken(response);

        // 2. リフレッシュトークンはサーバー側が設定したHTTP-Only Cookieで返されることを想定し、
        //    フロントエンドでは自動的にブラウザが保存するため、ここでは特別な処理は不要。
      })
    );
  }

  // アクセストークンの保存処理
  private saveAccessToken(response: LoginResponse): void {
    const accessTokenExpires = new Date().getUTCDate() + response.token.expiresIn;
    sessionStorage.setItem(this.ACCESS_TOKEN_KEY, response.token.accessToken);
    sessionStorage.setItem(this.ACCESS_TOKEN_EXPIRES_KEY, accessTokenExpires.toString());
    console.log('アクセストークンをセッションストレージに保存しました。');
  }

  /**
   * セッションストレージからアクセストークンを取得する (APIリクエストヘッダ付与用)
   */
  getAccessToken(): string | null {
    return sessionStorage.getItem(this.ACCESS_TOKEN_KEY);
  }
}

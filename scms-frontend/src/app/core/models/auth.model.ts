// ログインAPIのリクエストの型
export interface LoginRequest {
  email: string;
  password: string;
}

// ログインAPIのレスポンスの型
export interface AccessToken {
  accessToken: string;
  expiresIn: number;
}

export interface LoginResponse {
  id: string;
  name: string;
  token: AccessToken;
}

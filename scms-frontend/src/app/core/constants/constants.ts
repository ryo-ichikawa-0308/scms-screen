export const ACCESS_TOKEN_KEY = 'accessToken';
export const   ACCESS_TOKEN_EXPIRES_KEY = 'accessTokenExpires';

const BASE_URL = '/api/v1';
export const AUTH_ENDPOINTS = {
  // ログイン (POST /auth/login)
  LOGIN: `${BASE_URL}/auth/login`,
  // ログアウト (POST /auth/logout)
  LOGOUT: `${BASE_URL}/auth/logout`,
  // リフレッシュ (POST /auth/refresh)
  REFRESH_TOKEN: `${BASE_URL}/auth/refresh`,
};

/**
 * ユーザー提供サービス関連のエンドポイント
 */
export const USER_SERVICE_ENDPOINTS = {
  // サービス一覧取得 (POST /services)
  LIST: `${BASE_URL}/user-services/list`,
  // サービス詳細取得 (GET /services/{id})
  DETAIL: (id: string) => `${BASE_URL}/user-services/${id}`,
};

/**
 * 契約関連のエンドポイント
 */
 export const CONTRACT_ENDPOINTS = {
  // 契約一覧取得 (POST /services)
  LIST: `${BASE_URL}/contracts/list`,
  // 契約詳細取得 (GET /services/{id})
  DETAIL: (id: string) => `${BASE_URL}/contracts/${id}`,
  // 契約 (POST /services/{id})
  CREATE: `${BASE_URL}/contracts`,
  // 解約 (PATCH /services/{id})
  CANCEL: (id: string) => `${BASE_URL}/contracts/${id}`,
};
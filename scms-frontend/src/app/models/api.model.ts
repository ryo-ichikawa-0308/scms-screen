// サービス一覧のリクエスト
export interface ServiceRequest {
  serviceName?: string;
  offset?: number;
  limit?: number;
}

// サービス詳細 (在庫数を含む)
export interface ServiceDetail {
  /** ID */
  id: string;
  /** ユーザー名 */
  usersName: string;
  /** サービスID */
  servicesId: string;
  /** サービス名 */
  name: string;
  /** 概要 */
  description: string;
  /** 単価 */
  price: number;
  /** 在庫数 */
  stock: number;
  /** 単位 */
  unit: string;
}

// 契約一覧のリクエスト
export interface ContractRequest {
  serviceName?: string;
  offset?: number;
  limit?: number;
}

// 契約詳細 (注文数を含む)
export interface ContractDetail {
  /** ID */
  id: string;
  /** ユーザー名 */
  usersName: string;
  /** ユーザー提供サービスID */
  userServicesId: string;
  /** 契約数 */
  quantity: number;
  /** サービス名 */
  name: string;
  /** 単位 */
  unit: string;
}

// APIグリッドのレスポンス構造
export interface PaginatedResponse<T> {
  totalRecords: number;
  totalPages: number;
  currentPage: number;
  offset: number;
  limit: number;
  data: T[];
}

// ログインリクエスト
export interface LoginRequest {
  email: string;
  password: string;
}

// ログインAPIのレスポンスの型(アクセストークンとID情報)
export interface LoginResponse {
  id: string;
  name: string;
  token: AccessToken;
}

export interface AccessToken {
  accessToken: string;
  expiresIn: number;
}

// エラー
export interface ErrorPayload {
  message?: string;
  detail?: string;
}

// APIからのユーザー提供サービスリスト生データ型
export interface ServiceListApiResponse {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  offset: number;
  limit: number;
  userServices: ServiceDetail[];
}

// APIからの契約リスト生データ型
export interface ContractListApiResponse {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  offset: number;
  limit: number;
  contracts: ContractDetail[];
}
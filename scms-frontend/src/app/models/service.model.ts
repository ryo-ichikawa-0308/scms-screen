// サービス検索のリクエスト
export interface ServiceRequest {
  name: string;
}

// サービス明細の画面レスポンス
export interface Service {
  /** ID */
  id: string;
  /** サービスID */
  serviceId: string;
  /** 提供ユーザー名 */
  supplierName: string;
  /** サービス名 */
  name: string;
  /** 概要 */
  description: string;
  /** 単価 */
  price: number;
  /** 単位 */
  unit: string;
}

// サービス明細のAPIレスポンス
export interface UserServicesResponseItem {
  /** ID */
  id?: string;
  /** ユーザー名 */
  usersName?: string;
  /** サービスID */
  servicesId?: string;
  /** サービス名 */
  name?: string;
  /** 概要 */
  description?: string;
  /** 単価 */
  price?: number;
  /** 単位 */
  unit?: string;
}
export interface UserServicesResponse<UserServicesResponseItem> {
  /** 検索条件にあてはまる総件数 */
  totalCount: number;
  /** 総ページ数 */
  totalPages: number;
  /** ページ番号 */
  currentPage: number;
  /** 取得位置(リクエストと同じ値) */
  offset: number;
  /** 取得件数(リクエストと同じ値) */
  limit: number;
  /** 取得されたデータリスト。派生クラスで具体的なプロパティ名をつけて再定義する。 */
  userServices?: UserServicesResponseItem[];
}

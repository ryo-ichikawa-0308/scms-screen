// サービス検索のリクエスト
export interface ServiceRequest {
  name: string;
}

// サービス明細のレスポンス
export interface Service {
  /** ID */
  id: string;

  /** サービスID */
  serviceId: string;

  /** サービス名 */
  name: string;

  /** 概要 */
  description: string;

  /** 単価 */
  price: number;

  /** 単位 */
  unit: string;
}

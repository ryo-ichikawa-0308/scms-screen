import { inject, Injectable } from '@angular/core';
import { PaginatedResponse, ContractDetail, ContractListApiResponse } from 'src/app/models/api.model';
import { CONTRACT_ENDPOINTS } from '../constants/constants';
import { catchError, map, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * APIサービス (モック実装)
 */
@Injectable({ providedIn: 'root' })
export class ContractsService {
  private readonly CONTRACT_LIST_URL = CONTRACT_ENDPOINTS.LIST;
  private readonly CONTRACT_DETAIL_URL = CONTRACT_ENDPOINTS.DETAIL;
  private readonly CONTRACT_CREATE_URL = CONTRACT_ENDPOINTS.CREATE;
  private readonly CONTRACT_CANCEL_URL = CONTRACT_ENDPOINTS.CANCEL;
  constructor(private http: HttpClient) { }
  private snackBar = inject(MatSnackBar);

  /**
   * 契約一覧取得
   * @param query サービス名
   * @param pageIndex 開始ページ
   * @param pageSize 件数
   * @returns 契約一覧データ
   */
  getContractList(
    query: string,
    pageIndex: number,
    pageSize: number,
  ): Observable<PaginatedResponse<ContractDetail>> {
    const payload = {
      serviceName: query,
      offset: pageIndex * pageSize,
      limit: pageSize,
    };
    return this.http.post<ContractListApiResponse>(this.CONTRACT_LIST_URL, payload).pipe(
      map(apiResponse => {
        console.log("API Response received:", apiResponse);
        const contracts = apiResponse.contracts || [];
        const transformedResponse: PaginatedResponse<ContractDetail> = {
          totalRecords: apiResponse.totalCount,
          totalPages: apiResponse.totalPages,
          currentPage: apiResponse.currentPage,
          offset: payload.offset,
          limit: apiResponse.limit,
          data: contracts
        };
        console.log("transformed response:", transformedResponse);
        return transformedResponse;
      }),
      catchError((error) => {
        this.snackBar.open('API接続エラーが発生しました。', '閉じる', { duration: 3000 });
        console.error('契約一覧の取得に失敗しました:', error);
        return of({
          totalRecords: 0,
          totalPages: 0,
          currentPage: pageIndex,
          offset: payload.offset,
          limit: pageSize,
          data: [],
        });
      }),
    );
  }

  /**
   * 契約詳細の取得
   * @param id 
   * @returns 契約詳細
   */
  getContractDetail(id: string): Observable<ContractDetail | undefined> {
    return this.http
      .get<ContractDetail>(`${this.CONTRACT_DETAIL_URL}/${id}`)
      .pipe(
        catchError((error) => {
          console.error('契約詳細の取得に失敗しました:', error);
          this.snackBar.open('API接続エラーが発生しました。', '閉じる', { duration: 3000 });
          return of(undefined);
        }),
      );
  }

  /**
   * サービスを契約する
   * @param serviceId サービスID
   * @param quantity 契約件数
   * @returns 契約ID
   */
  executeContract(serviceId: string, quantity: number): Observable<string | undefined> {
    const payload = {
      userServiceId: serviceId,
      quantity: quantity,
    };
    return this.http.post(this.CONTRACT_CREATE_URL, payload, { responseType: 'text' }).pipe(
      catchError((error) => {
        console.error('契約に失敗しました。:', error);
        this.snackBar.open('API接続エラーが発生しました。', '閉じる', { duration: 3000 });
        return of(undefined);
      }),
    );
  }

  /**
   * サービスを解約する
   * @param contractId 契約ID
   * @returns void
   */
  executeCancellation(contractId: string): Observable<void | undefined> {
    return this.http
      .patch<void>(`${this.CONTRACT_CANCEL_URL}/${contractId}`, { responseType: 'text' })
      .pipe(
        catchError((error) => {
          console.error('解約に失敗しました。:', error);
          this.snackBar.open('API接続エラーが発生しました。', '閉じる', { duration: 3000 });
          return of(undefined);
        }),
      );
  }
}

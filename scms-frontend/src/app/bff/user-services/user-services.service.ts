import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { PaginatedResponse, ServiceDetail, ServiceListApiResponse } from 'src/app/models/api.model';
import { USER_SERVICE_ENDPOINTS } from '../constants/constants';
import { catchError, map, Observable, of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class UserServicesService {
  private readonly SERVICE_LIST_URL = USER_SERVICE_ENDPOINTS.LIST;
  private readonly SERVICE_DETAIL_URL = USER_SERVICE_ENDPOINTS.DETAIL;
  constructor(private http: HttpClient) { }
  private snackBar = inject(MatSnackBar);

  /**
   * サービス一覧を取得する
   * @param query サービス名
   * @param pageIndex 開始ページ
   * @param pageSize 件数
   * @returns サービス一覧データ
   */
  getServiceList(
    query: string,
    pageIndex: number,
    pageSize: number,
  ): Observable<PaginatedResponse<ServiceDetail>> {
    const payload = {
      serviceName: query,
      offset: pageIndex * pageSize,
      limit: pageSize,
    };
    return this.http.post<ServiceListApiResponse>(this.SERVICE_LIST_URL, payload).pipe(
      map(apiResponse => {
        console.log("API Response received:", apiResponse);
        const servicesData = apiResponse.userServices || [];
        const transformedResponse: PaginatedResponse<ServiceDetail> = {
          totalRecords: apiResponse.totalCount,
          totalPages: apiResponse.totalPages,
          currentPage: apiResponse.currentPage,
          offset: apiResponse.offset,
          limit: apiResponse.limit,
          data: servicesData
        };
        console.log("transformed response:", transformedResponse);
        return transformedResponse;
      }),
      catchError((error) => {
        this.snackBar.open('API接続エラーが発生しました。', '閉じる', { duration: 3000 });
        console.error('サービス一覧の取得に失敗しました:', error);
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
   * ユーザー提供サービス詳細を取得する
   * @param id サービスID
   * @returns ユーザー提供サービス詳細
   */
  getServiceDetail(id: string): Observable<ServiceDetail | undefined> {
    return this.http
      .get<ServiceDetail>(`${this.SERVICE_DETAIL_URL}/${id}`)
      .pipe(
        catchError((error) => {
          console.error('サービス詳細の取得に失敗しました:', error);
          this.snackBar.open('API接続エラーが発生しました。', '閉じる', { duration: 3000 });
          return of(undefined);
        }),
      );
  }
}

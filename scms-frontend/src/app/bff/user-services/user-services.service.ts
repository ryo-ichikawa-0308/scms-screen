import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PaginatedResponse, ServiceDetail } from 'src/app/models/api.model';

@Injectable({
  providedIn: 'root',
})
export class UserServicesService {
  constructor(private http: HttpClient) {}
  // ダミーデータ
  private services: ServiceDetail[] = Array.from({ length: 50 }, (_, i) => ({
    id: String(i + 1),
    servicesId: String(i + 1),
    name: `サービス A-${i + 1}`,
    usersName: `サービス A-${i + 1} 提供者`,
    price: 1000 + i * 10,
    description: `これはサービス A-${i + 1} の詳細な説明です。`,
    stock: Math.floor(Math.random() * 10) + 1,
    unit: '個',
  }));
  // モックAPIコール: ページングされたサービス一覧
  getServiceList(
    query: string,
    pageIndex: number,
    pageSize: number
  ): Promise<PaginatedResponse<ServiceDetail>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filtered = this.services.filter(
          (s) => s.name || ''.toLowerCase().includes(query.toLowerCase())
        );
        const start = pageIndex * pageSize;
        const end = start + pageSize;
        const data = filtered.slice(start, end);

        resolve({
          totalRecords: filtered.length,
          totalPages: Math.ceil(filtered.length / pageSize),
          currentPage: pageIndex,
          offset: start,
          limit: pageSize,
          data: data.map((d) => ({
            id: d.id,
            name: d.name,
            price: d.price,
            unit: d.unit,
            stock: d.stock,
            usersName: d.usersName,
            servicesId: d.servicesId,
            description: d.description,
          })),
        });
      }, 500);
    });
  }

  // モックAPIコール: サービス詳細
  getServiceDetail(id: string): Promise<ServiceDetail | undefined> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.services.find((s) => s.id === id));
      }, 500);
    });
  }
}

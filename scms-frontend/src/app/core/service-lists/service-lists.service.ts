import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PagingList } from 'src/app/models/page-config.model';
import { Service, ServiceRequest } from 'src/app/models/service.model';

@Injectable({
  providedIn: 'root',
})
export class ServiceListsService {
  constructor(private http: HttpClient) {}

  getServiceList(
    searchCondition: ServiceRequest,
    startIndex: number,
    itemsPerPage: number,
  ): PagingList<Service> {
    console.log(searchCondition);
    console.log(startIndex);
    console.log(itemsPerPage);
    const result = {
      data: [
        {
          id: 'id-001',
          supplierName: '提供者００１',
          serviceId: 'service-001',
          name: 'サービス００１',
          description: '説明００１',
          price: 100,
          unit: '個',
        },
        {
          id: 'id-002',
          supplierName: '提供者００２',
          serviceId: 'service-002',
          name: 'サービス００２',
          description: '説明００２',
          price: 200,
          unit: '個',
        },
        {
          id: 'id-003',
          supplierName: '提供者００３',
          serviceId: 'service-003',
          name: 'サービス００３',
          description: '説明００３',
          price: 300,
          unit: '個',
        },
      ],
      pagingConfig: {
        totalItems: 100,
        currentPage: 1,
        itemsPerPage: 10,
        maxPageLinks: 5,
      },
    };
    return result;
  }
}

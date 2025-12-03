import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UserServicesService } from './user-services.service';
import { USER_SERVICE_ENDPOINTS } from '../constants/constants';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ServiceDetail, PaginatedResponse, ServiceListApiResponse } from 'src/app/models/api.model';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';

describe('UserServicesService', () => {
  let service: UserServicesService;
  let httpMock: HttpTestingController;
  let snackBar: MatSnackBar;

  const LIST_URL = USER_SERVICE_ENDPOINTS.LIST;
  const DETAIL_BASE_URL = USER_SERVICE_ENDPOINTS.DETAIL;

  const MOCK_SERVICE: ServiceDetail = {
    id: 's1',
    usersName: 'Provider A',
    servicesId: 'idA',
    name: 'Service X',
    description: 'Desc',
    price: 100,
    stock: 50,
    unit: 'GB',
  };
  const MOCK_API_RESPONSE: ServiceListApiResponse = {
    userServices: [MOCK_SERVICE],
    totalCount: 1,
    totalPages: 1,
    currentPage: 0,
    offset: 0,
    limit: 10,
  };

  const MOCK_PAGINATED_RESPONSE: PaginatedResponse<ServiceDetail> = {
    totalRecords: 1,
    totalPages: 1,
    currentPage: 0,
    offset: 0,
    limit: 10,
    data: [MOCK_SERVICE],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        UserServicesService,
        {
          provide: MatSnackBar,
          useValue: { open: jasmine.createSpy('open').and.returnValue(of()) },
        },
      ],
    });

    service = TestBed.inject(UserServicesService);
    httpMock = TestBed.inject(HttpTestingController);
    snackBar = TestBed.inject(MatSnackBar);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getServiceList', () => {
    const query = 'testService';
    const pageIndex = 0;
    const pageSize = 10;
    const expectedPayload = {
      serviceName: query,
      offset: pageIndex * pageSize,
      limit: pageSize,
    };

    it('正常系: API成功時、PaginatedResponseの形式にデータを変換して返すこと', (done) => {
      service.getServiceList(query, pageIndex, pageSize).subscribe((response) => {
        expect(response).toEqual(MOCK_PAGINATED_RESPONSE);
        expect(response.data.length).toBe(1);
           expect(response.data[0].id).toBe('s1');
        done();
      });
      const req = httpMock.expectOne(LIST_URL);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(expectedPayload);
      req.flush(MOCK_API_RESPONSE);
    });
    it('異常系: API失敗時、空のPaginatedResponseが返され、SnackBarが表示されること', (done) => {
      service.getServiceList(query, pageIndex, pageSize).subscribe((response) => {
        expect(response.data.length).toBe(0);
        expect(response.totalRecords).toBe(0);
        expect(snackBar.open).toHaveBeenCalledWith('API接続エラーが発生しました。', '閉じる', {
          duration: 3000,
        });
        done();
      });
      const req = httpMock.expectOne(LIST_URL);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });
  });
  describe('getServiceDetail', () => {
    const serviceId = 's101';
    const detailUrl = `${DETAIL_BASE_URL}/${serviceId}`;
    it('正常系: サービスIDを指定して詳細データが取得できること', (done) => {
      service.getServiceDetail(serviceId).subscribe((detail) => {
        expect(detail).toEqual(MOCK_SERVICE);
        done();
      });
      const req = httpMock.expectOne(detailUrl);
      expect(req.request.method).toBe('GET');
      req.flush(MOCK_SERVICE);
    });
    it('異常系: API失敗時、undefinedが返され、SnackBarが表示されること', (done) => {
      service.getServiceDetail(serviceId).subscribe((detail) => {
        expect(detail).toBeUndefined();
        expect(snackBar.open).toHaveBeenCalled();
        done();
      });
      const req = httpMock.expectOne(detailUrl);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
  });
});

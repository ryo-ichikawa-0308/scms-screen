import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ContractsService } from './contracts.service';
import { CONTRACT_ENDPOINTS } from '../constants/constants';
import { ContractDetail, ContractListApiResponse, PaginatedResponse } from 'src/app/models/api.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideHttpClient } from '@angular/common/http';

describe('ContractsService', () => {
  let service: ContractsService;
  let httpMock: HttpTestingController;
  let snackBar: MatSnackBar;

  const LIST_URL = CONTRACT_ENDPOINTS.LIST;
  const CREATE_URL = CONTRACT_ENDPOINTS.CREATE;

  const MOCK_CONTRACT_DETAIL: ContractDetail = {
    id: 'c1',
    usersName: 'Provider A',
    userServicesId: 's1',
    quantity: 10,
    name: 'Service X',
    unit: 'GB',
    price: 100,
    stock: 50,
  };
  const MOCK_API_RESPONSE: ContractListApiResponse = {
    contracts: [MOCK_CONTRACT_DETAIL],
    totalCount: 1,
    totalPages: 1,
    currentPage: 0,
    offset: 0,
    limit: 10,
  };
  const MOCK_PAGINATED_RESPONSE: PaginatedResponse<ContractDetail> = {
    totalRecords: 1,
    totalPages: 1,
    currentPage: 0,
    offset: 0,
    limit: 10,
    data: [MOCK_CONTRACT_DETAIL],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ContractsService,
        { provide: MatSnackBar, useValue: { open: jasmine.createSpy('open') } },
      ],
    });
    service = TestBed.inject(ContractsService);
    httpMock = TestBed.inject(HttpTestingController);
    snackBar = TestBed.inject(MatSnackBar);
  });

  afterEach(() => {
    httpMock.verify();
  });
  describe('getContractList', () => {
    const query = 'test';
    const pageIndex = 0;
    const pageSize = 10;
    const expectedPayload = {
      serviceName: query,
      offset: pageIndex * pageSize,
      limit: pageSize,
    };

    it('正常系: 契約一覧が取得でき、返却値の形式が正しいこと', (done) => {
      service.getContractList(query, pageIndex, pageSize).subscribe((response) => {
      expect(response).toEqual(MOCK_PAGINATED_RESPONSE);
              expect(response.data.length).toBe(1);
        expect(response.data[0].id).toBe('c1');
        done();
      });
      const req = httpMock.expectOne(LIST_URL);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(expectedPayload);
      req.flush(
        MOCK_API_RESPONSE);
    });
    it('異常系: API失敗時、空のPaginatedResponseが返され、SnackBarが表示されること', (done) => {
      service.getContractList(query, pageIndex, pageSize).subscribe((response) => {
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
  describe('getContractDetail', () => {
    const contractId = 'c1';
    it('正常系: 契約詳細が取得できること', (done) => {
      service.getContractDetail(contractId).subscribe((detail) => {
        expect(detail).toBeDefined();
        expect(detail?.id).toBe(contractId);
        done();
      });
      const req = httpMock.expectOne(`${service['CONTRACT_DETAIL_URL']}/${contractId}`);
      expect(req.request.method).toBe('GET');
      req.flush(MOCK_CONTRACT_DETAIL);
    });
    it('異常系: API失敗時、undefinedが返され、SnackBarが表示されること', (done) => {
      service.getContractDetail(contractId).subscribe((detail) => {
        expect(detail).toBeUndefined();
        expect(snackBar.open).toHaveBeenCalledWith('API接続エラーが発生しました。', '閉じる', {
          duration: 3000, });
        done();
      });
      const req = httpMock.expectOne(`${service['CONTRACT_DETAIL_URL']}/${contractId}`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });
  describe('executeContract', () => {
    const serviceId = 's1';
    const quantity = 5;
    it('正常系: 契約が成功し、契約IDの文字列が返却されること', (done) => {
      service.executeContract(serviceId, quantity).subscribe((contractId) => {
        expect(contractId).toBe('newContractId123');
        done();
      });
      const req = httpMock.expectOne(CREATE_URL);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ userServiceId: serviceId, quantity: quantity });
      req.flush('newContractId123', { status: 201, statusText: 'Created' });
    });
    it('異常系: 契約APIが失敗した場合、undefinedが返され、SnackBarが表示されること', (done) => {
      service.executeContract(serviceId, quantity).subscribe((contractId) => {
        expect(contractId).toBeUndefined();
        expect(snackBar.open).toHaveBeenCalled();
        done();
      });
      const req = httpMock.expectOne(CREATE_URL);
      req.flush('在庫不足', { status: 400, statusText: 'Bad Request' });
    });
  });
  describe('executeCancellation', () => {
    const contractId = 'c1';
    it('正常系: 契約キャンセルが成功すること', (done) => {
      service.executeCancellation(contractId).subscribe(() => {
        done();
      });
      const req = httpMock.expectOne(`${service['CONTRACT_CANCEL_URL']}/${contractId}`);
      expect(req.request.method).toBe('PATCH');
      req.flush({}, { status: 200, statusText: 'OK' });
    });
    it('異常系: 契約キャンセルAPIが失敗した場合、SnackBarが表示されること', (done) => {
      service.executeCancellation(contractId).subscribe(() => {
        expect(snackBar.open).toHaveBeenCalledWith('API接続エラーが発生しました。', '閉じる', {
          duration: 3000,
        });
        done();
      });
      const req = httpMock.expectOne(`${service['CONTRACT_CANCEL_URL']}/${contractId}`);
      req.flush('キャンセル失敗', { status: 500, statusText: 'Internal Server Error' });
    });
  });
});

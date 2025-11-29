// contracts.service.spec.ts

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ContractsService } from './contracts.service';
import { CONTRACT_ENDPOINTS } from '../constants/constants';
import { ContractDetail, PaginatedResponse } from 'src/app/models/api.model';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

describe('ContractsService', () => {
  let service: ContractsService;
  let httpMock: HttpTestingController;
  let snackBar: MatSnackBar;

  const LIST_URL = CONTRACT_ENDPOINTS.LIST;
  const DETAIL_URL = CONTRACT_ENDPOINTS.DETAIL;
  const CREATE_URL = CONTRACT_ENDPOINTS.CREATE;
  const CANCEL_URL = CONTRACT_ENDPOINTS.CANCEL;
  
  const MOCK_CONTRACT_DETAIL: ContractDetail = {
    id: 'c1', usersName: 'Provider A', userServicesId: 's1', quantity: 10,
    name: 'Service X', unit: 'GB', price: 100, stock: 50 
  };
  const MOCK_PAGINATED_RESPONSE: PaginatedResponse<ContractDetail> = {
    totalRecords: 1, totalPages: 1, currentPage: 0, offset: 0, limit: 10,
    data: [MOCK_CONTRACT_DETAIL]
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ContractsService,
        // MatSnackBarのモック化
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

  // ====================================================================================================
  // ContractsService > getContractList()
  // ====================================================================================================
  describe('getContractList', () => {
    const query = 'test';
    const pageIndex = 0;
    const pageSize = 10;

    // ----------------------------------------------------------------------------------------------------
    // getContractList() > 正常系: 契約一覧が取得できる
    // ----------------------------------------------------------------------------------------------------
    it('正常系: 契約一覧が取得でき、返却値の形式が正しいこと', (done) => {
      // 実行
      service.getContractList(query, pageIndex, pageSize).subscribe(response => {
        expect(response.data.length).toBe(1);
        expect(response.data[0].id).toBe('c1');
        done();
      });

      // 検証: API呼び出し
      const req = httpMock.expectOne(LIST_URL);
      expect(req.request.method).toBe('POST');
      req.flush({ contracts: MOCK_PAGINATED_RESPONSE.data, totalCount: 1, totalPages: 1, currentPage: 0, offset: 0, limit: 10 });
    });

    // ----------------------------------------------------------------------------------------------------
    // getContractList() > 異常系: APIエラーが発生した場合
    // ----------------------------------------------------------------------------------------------------
    it('異常系: API失敗時、空のPaginatedResponseが返され、SnackBarが表示されること', (done) => {
      // 実行
      service.getContractList(query, pageIndex, pageSize).subscribe(response => {
        expect(response.data.length).toBe(0);
        expect(snackBar.open).toHaveBeenCalled();
        done();
      });

      // 検証: API呼び出し
      const req = httpMock.expectOne(LIST_URL);
      req.error(new ErrorEvent('Network error'), { status: 500, statusText: 'Server Error' });
    });
  });

  // ====================================================================================================
  // ContractsService > executeContract()
  // ====================================================================================================
  describe('executeContract', () => {
    const serviceId = 's1';
    const quantity = 5;

    // ----------------------------------------------------------------------------------------------------
    // executeContract() > 正常系: 契約が実行され、契約IDが返却される
    // ----------------------------------------------------------------------------------------------------
    it('正常系: 契約が成功し、契約IDの文字列が返却されること', (done) => {
      // 実行
      service.executeContract(serviceId, quantity).subscribe(contractId => {
        expect(contractId).toBe('newContractId123');
        done();
      });

      // 検証: API呼び出し
      const req = httpMock.expectOne(CREATE_URL);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ userServiceId: serviceId, quantity: quantity });
      req.flush('newContractId123', { status: 201, statusText: 'Created' });
    });

    // ----------------------------------------------------------------------------------------------------
    // executeContract() > 異常系: 契約APIが失敗した場合
    // ----------------------------------------------------------------------------------------------------
    it('異常系: 契約APIが失敗した場合、undefinedが返され、SnackBarが表示されること', (done) => {
      // 実行
      service.executeContract(serviceId, quantity).subscribe(contractId => {
        expect(contractId).toBeUndefined();
        expect(snackBar.open).toHaveBeenCalled();
        done();
      });

      // 検証: API呼び出し
      const req = httpMock.expectOne(CREATE_URL);
      req.flush('在庫不足', { status: 400, statusText: 'Bad Request' });
    });
  });
});
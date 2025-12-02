import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ContractListComponent } from './contract-list.component';
import { ContractsService } from 'src/app/bff/contracts/contracts.service';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { ContractDetail, PaginatedResponse } from 'src/app/models/api.model';
import { PageEvent } from '@angular/material/paginator';
import { ContractDetailComponent } from 'src/app/pages/contract-detail/contract-detail.component';

// モックの契約データ
const MOCK_CONTRACT_LIST: ContractDetail[] = [
  {
    id: 'c1',
    usersName: 'User B',
    userServicesId: 's1',
    quantity: 2,
    name: 'Contract Y',
    unit: 'TB',
    price: 500,
    stock: 10,
  },
  {
    id: 'c2',
    usersName: 'User C',
    userServicesId: 's2',
    quantity: 1,
    name: 'Contract Z',
    unit: 'GB',
    price: 100,
    stock: 5,
  },
];

// モックのPaginatedResponse
const MOCK_PAGINATED_RESPONSE: PaginatedResponse<ContractDetail> = {
  totalRecords: 2,
  totalPages: 1,
  currentPage: 0,
  offset: 0,
  limit: 10,
  data: MOCK_CONTRACT_LIST,
};

// ContractsServiceのモック
const mockContractsService = {
  getContractList: jasmine
    .createSpy('getContractList')
    .and.returnValue(of(MOCK_PAGINATED_RESPONSE)),
  getContractDetail: jasmine
    .createSpy('getContractDetail')
    .and.returnValue(of(MOCK_CONTRACT_LIST[0])),
};

// MatDialogのモック
const mockMatDialog = {
  open: jasmine.createSpy('open'),
};

// MatSnackBarのモック
const mockMatSnackBar = {
  open: jasmine.createSpy('open'),
};

describe('ContractListComponent', () => {
  let component: ContractListComponent;
  let fixture: ComponentFixture<ContractListComponent>;
  let contractsService: jasmine.SpyObj<ContractsService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContractListComponent, MatDialogModule],
      providers: [
        { provide: ContractsService, useValue: mockContractsService },
        { provide: MatDialog, useValue: mockMatDialog },
        { provide: MatSnackBar, useValue: mockMatSnackBar },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ContractListComponent);
    component = fixture.componentInstance;
    contractsService = TestBed.inject(ContractsService) as jasmine.SpyObj<ContractsService>;

    contractsService.getContractList.and.returnValue(of(MOCK_PAGINATED_RESPONSE));
    contractsService.getContractDetail.and.returnValue(of(MOCK_CONTRACT_LIST[0]));
    fixture.detectChanges();
  });

  afterEach(() => {
    contractsService.getContractList.calls.reset();
    contractsService.getContractDetail.calls.reset();
  });

  describe('fetchData', () => {
    describe('正常系', () => {
      it('✅ コンポーネント作成時に契約一覧が取得されること', fakeAsync(() => {
        component.fetchData();
        tick();
        expect(component.dataSource()).toEqual(MOCK_CONTRACT_LIST);
        expect(component.totalRecords()).toBe(MOCK_PAGINATED_RESPONSE.totalRecords);
        expect(component.isLoading()).toBeFalse();
      }));
    });
    describe('異常系', () => {
      it('✅ データ取得に失敗した場合、SnackBarが表示され、データが空になること', fakeAsync(() => {
        contractsService.getContractList.and.returnValue(throwError(() => new Error('API Error')));
        component.fetchData();
        expect(contractsService.getContractList).toHaveBeenCalled();
        expect(mockMatSnackBar.open).toHaveBeenCalledWith(
          'データ取得に失敗しました。コンソールを確認してください。',
          '閉じる',
          { duration: 3000 },
        );
        expect(component.dataSource()).toEqual([]);
        expect(component.totalRecords()).toBe(0);
        expect(component.isLoading()).toBeFalse();
      }));
    });
  });
  describe('search', () => {
    it('✅ search() が呼ばれると、currentPageがリセットされ、fetchDataが呼ばれること', fakeAsync(() => {
      component.searchQuery = 'NewQuery';
      component.currentPage.set(5); // 現在のページをリセット対象のページとは別の値に設定
      contractsService.getContractList.calls.reset(); // 実行回数をリセット
      component.search(0); // 1ページ目を検索
      tick();
      // currentPage が 0 に設定されること
      expect(component.currentPage()).toBe(0);
      // 新しいクエリとページ情報でAPIが呼ばれること
      expect(contractsService.getContractList).toHaveBeenCalledWith(
        component.searchQuery,
        0,
        component.pageSize(),
      );
    }));

    it('✅ handlePageEvent() が呼ばれると、新しいページ情報でfetchDataが呼ばれること', fakeAsync(() => {
      contractsService.getContractList.calls.reset();

      const mockPageEvent: PageEvent = {
        pageIndex: 2, // 3ページ目
        pageSize: 5, // 1ページあたりの件数変更
        length: 100,
      };
      component.handlePageEvent(mockPageEvent);
      tick();
      expect(component.currentPage()).toBe(2);
      expect(component.pageSize()).toBe(5);
      expect(contractsService.getContractList).toHaveBeenCalledWith(component.searchQuery, 2, 5);
    }));
  });

  describe('openDetail', () => {
    it('✅ openDetail() が呼ばれたとき、MatDialog.openが呼ばれること', () => {
      const contractId = 'test-contract-id';
      component.openDetail(contractId);
      expect(mockMatDialog.open).toHaveBeenCalledWith(ContractDetailComponent, {
        data: { contractId: contractId },
        width: '90%',
        maxWidth: '800px',
      });
    });

    it('✅ 詳細画面クローズ後、fetchDataが再実行されること', fakeAsync(() => {
      const contractId = 'test-contract-id';
      contractsService.getContractList.calls.reset();
      component.openDetail(contractId);
      tick();
      expect(contractsService.getContractList).toHaveBeenCalledTimes(1);
      expect(contractsService.getContractList).toHaveBeenCalledWith(
        component.searchQuery,
        component.currentPage(),
        component.pageSize(),
      );
    }));
  });
});

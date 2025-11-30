import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ContractListComponent } from './contract-list.component';
import { ContractsService } from 'src/app/bff/contracts/contracts.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError, Subject } from 'rxjs';
import { ContractDetail, PaginatedResponse } from 'src/app/models/api.model';
import { PageEvent } from '@angular/material/paginator';
import { ContractDetailComponent } from 'src/app/pages/contract-detail/contract-detail.component';

// -------------------------------------------------------------------------
// モックの定義
// -------------------------------------------------------------------------

// モックの契約データ
const MOCK_CONTRACT_LIST: ContractDetail[] = [
  { id: 'c1', usersName: 'User B', userServicesId: 's1', quantity: 2, name: 'Contract Y', unit: 'TB', price: 500, stock: 10 },
  { id: 'c2', usersName: 'User C', userServicesId: 's2', quantity: 1, name: 'Contract Z', unit: 'GB', price: 100, stock: 5 },
];

// モックのPaginatedResponse
const MOCK_PAGINATED_RESPONSE: PaginatedResponse<ContractDetail> = {
  totalRecords: 2,
  totalPages: 1,
  currentPage: 0,
  offset: 0,
  limit: 10,
  data: MOCK_CONTRACT_LIST
};

// ContractsServiceのモック
const mockContractsService = {
  getContractList: jasmine.createSpy('getContractList').and.returnValue(of(MOCK_PAGINATED_RESPONSE)),
  getContractDetail: jasmine.createSpy('getContractDetail').and.returnValue(of(MOCK_CONTRACT_LIST[0])),
};

// MatDialogのモック
const mockMatDialog = {
  open: jasmine.createSpy('open').and.returnValue({
    afterClosed: () => of(true) // 詳細画面を閉じたら成功を返す
  }),
};

// MatSnackBarのモック
const mockMatSnackBar = {
  open: jasmine.createSpy('open'),
};

// -------------------------------------------------------------------------
// テストスイート
// -------------------------------------------------------------------------

describe('ContractListComponent', () => {
  let component: ContractListComponent;
  let fixture: ComponentFixture<ContractListComponent>;
  let contractsService: jasmine.SpyObj<ContractsService>;
  let dialog: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // Standalone Component のため imports に直接指定
      imports: [ContractListComponent, MatDialogModule],
      providers: [
        // 依存オブジェクトをモックで提供
        { provide: ContractsService, useValue: mockContractsService },
        { provide: MatDialog, useValue: mockMatDialog },
        { provide: MatSnackBar, useValue: mockMatSnackBar },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ContractListComponent);
    component = fixture.componentInstance;
    
    // Spyの取得（型を明確にするため）
    contractsService = TestBed.inject(ContractsService) as jasmine.SpyObj<ContractsService>;
    dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    
    // 初期化時に fetchServiceList が呼ばれる
    contractsService.getContractList.calls.reset();
  });

  // -------------------------------------------------------------------------
  // 1. 初期化とデータ取得のテスト
  // -------------------------------------------------------------------------
  it('✅ コンポーネント作成時に契約一覧が取得されること', fakeAsync(() => {
    fixture.detectChanges(); // ngOnInit 実行

    // サービスが初期クエリで呼ばれることを確認
    expect(contractsService.getContractList).toHaveBeenCalledWith('', 0, 10);
    
    // データがSignalsに設定されることを確認
    tick();
    expect(component.dataSource()).toEqual(MOCK_CONTRACT_LIST);
    expect(component.totalRecords()).toBe(MOCK_PAGINATED_RESPONSE.totalRecords);
    expect(component.isLoading()).toBeFalse();
  }));

  it('✅ データ取得に失敗した場合、SnackBarが表示され、データが空になること', fakeAsync(() => {
    // API呼び出しをエラーにする
    contractsService.getContractList.and.returnValue(throwError(() => new Error('API Error')));
    
    fixture.detectChanges(); // ngOnInit 実行
    
    expect(contractsService.getContractList).toHaveBeenCalled();
    
    tick();
    // SnackBarが呼ばれることを確認
    expect(mockMatSnackBar.open).toHaveBeenCalledWith('API接続エラーが発生しました。', '閉じる', { duration: 3000 });
    // データが空になることを確認
    expect(component.dataSource()).toEqual([]);
    expect(component.totalRecords()).toBe(0);
    expect(component.isLoading()).toBeFalse();
  }));

  // -------------------------------------------------------------------------
  // 2. 検索機能のテスト
  // -------------------------------------------------------------------------
  it('✅ search() が呼ばれると、currentPageがリセットされ、fetchDataが呼ばれること', fakeAsync(() => {
    component.searchQuery = 'NewQuery';
    component.currentPage.set(5); // 現在のページをリセット対象のページとは別の値に設定
    contractsService.getContractList.calls.reset(); // 実行回数をリセット
    
    component.search(0); // 1ページ目を検索
    
    tick();
    
    // currentPage が 0 に設定されること
    expect(component.currentPage()).toBe(0);
    // 新しいクエリとページ情報でAPIが呼ばれること
    expect(contractsService.getContractList).toHaveBeenCalledWith(component.searchQuery, 0, component.pageSize());
  }));

  // -------------------------------------------------------------------------
  // 3. ページング機能のテスト
  // -------------------------------------------------------------------------
  it('✅ handlePageEvent() が呼ばれると、新しいページ情報でfetchDataが呼ばれること', fakeAsync(() => {
    contractsService.getContractList.calls.reset();
    
    const mockPageEvent: PageEvent = {
      pageIndex: 2, // 3ページ目
      pageSize: 5,  // 1ページあたりの件数変更
      length: 100
    };

    component.handlePageEvent(mockPageEvent);
    
    tick();

    // Signalsが更新されていることを確認
    expect(component.currentPage()).toBe(2);
    expect(component.pageSize()).toBe(5);
    // 新しいページ情報でAPIが呼ばれること
    expect(contractsService.getContractList).toHaveBeenCalledWith(component.searchQuery, 2, 5);
  }));
  
  // -------------------------------------------------------------------------
  // 4. 詳細画面表示のテスト
  // -------------------------------------------------------------------------
  it('✅ openDetail() が呼ばれたとき、MatDialog.openが呼ばれること', () => {
    const contractId = 'test-contract-id';
    
    component.openDetail(contractId);
    
    // MatDialog.open が、ContractDetailComponentと正しいデータで呼ばれていること
    expect(dialog.open).toHaveBeenCalledWith(ContractDetailComponent, {
      data: { contractId: contractId },
      width: '90%',
      maxWidth: '800px',
    });
  });

  it('✅ 詳細画面クローズ後、fetchDataが再実行されること', fakeAsync(() => {
    const contractId = 'test-contract-id';
    contractsService.getContractList.calls.reset(); // 初期化時に呼ばれた分をリセット
    
    // openDetail実行
    component.openDetail(contractId);
    
    // ダイアログの afterClosed() の結果が流れる (of(true)が流れる)
    tick(); 

    // fetchData が再実行されていること
    expect(contractsService.getContractList).toHaveBeenCalledTimes(1);
    expect(contractsService.getContractList).toHaveBeenCalledWith(component.searchQuery, component.currentPage(), component.pageSize());
  }));
});
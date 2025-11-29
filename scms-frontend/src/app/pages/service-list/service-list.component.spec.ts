// service-list.component.spec.ts

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ServiceListComponent } from './service-list.component';
import { UserServicesService } from 'src/app/bff/user-services/user-services.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { ServiceDetail, PaginatedResponse } from 'src/app/models/api.model';
import { PageEvent } from '@angular/material/paginator';

describe('ServiceListComponent', () => {
  let component: ServiceListComponent;
  let fixture: ComponentFixture<ServiceListComponent>;
  let mockUserService: jasmine.SpyObj<UserServicesService>;
  let mockDialog: jasmine.SpyObj<MatDialog>;

  const MOCK_SERVICE_DETAIL: ServiceDetail = {
    id: 's1', usersName: 'Provider A', servicesId: 'idA', name: 'Service X',
    description: 'Desc', price: 100, stock: 50, unit: 'GB'
  };
  const MOCK_PAGINATED_RESPONSE: PaginatedResponse<ServiceDetail> = {
    totalRecords: 1, totalPages: 1, currentPage: 0, offset: 0, limit: 10,
    data: [MOCK_SERVICE_DETAIL]
  };

  beforeEach(async () => {
    // モックオブジェクトの作成
    mockUserService = jasmine.createSpyObj('UserServicesService', ['getServiceList']);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [ServiceListComponent, MatDialogModule],
      providers: [
        { provide: UserServicesService, useValue: mockUserService },
        { provide: MatDialog, useValue: mockDialog },
        { provide: MatSnackBar, useValue: { open: () => {} } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ServiceListComponent);
    component = fixture.componentInstance;

    // 初期データ取得のモック
    mockUserService.getServiceList.and.returnValue(of(MOCK_PAGINATED_RESPONSE));
    fixture.detectChanges();
  });

  // ====================================================================================================
  // ServiceListComponent > fetchData()
  // ====================================================================================================
  describe('fetchData', () => {
    
    // ----------------------------------------------------------------------------------------------------
    // fetchData() > 正常系: サービス一覧が取得でき、画面に表示される
    // ----------------------------------------------------------------------------------------------------
    it('正常系: データが正常に取得され、dataSourceとtotalRecordsが更新されること', () => {
      // 初期化時の実行を検証
      expect(component.isLoading()).toBeFalse();
      expect(component.dataSource()).toEqual(MOCK_PAGINATED_RESPONSE.data);
      expect(component.totalRecords()).toBe(1);
    });

    // ----------------------------------------------------------------------------------------------------
    // fetchData() > 異常系: API呼び出しでエラーが発生した場合
    // ----------------------------------------------------------------------------------------------------
    it('異常系: API呼び出しでエラーが発生した場合、dataSourceは空になり、isLoadingがfalseになること', () => {
      // 準備: エラーを返すようにモックを設定
      mockUserService.getServiceList.and.returnValue(throwError(() => new Error('API Error')));
      
      // 実行
      component.fetchData();
      
      // 検証
      expect(component.isLoading()).toBeFalse();
      expect(component.dataSource()).toEqual([]);
      expect(component.totalRecords()).toBe(0);
    });
  });

  // ====================================================================================================
  // ServiceListComponent > handlePageEvent()
  // ====================================================================================================
  describe('handlePageEvent', () => {
    
    // ----------------------------------------------------------------------------------------------------
    // handlePageEvent() > 正常系: ページングイベントが適切に処理され、データが再取得される
    // ----------------------------------------------------------------------------------------------------
    it('正常系: PageEventを受け取り、新しいページサイズとページ番号でfetchDataが呼ばれること', () => {
      // fetchDataの呼び出し回数をリセット (初期呼び出し分を無視するため)
      mockUserService.getServiceList.calls.reset(); 
      
      const newEvent: PageEvent = { pageIndex: 1, pageSize: 20, length: 1 };
      
      // 実行
      component.handlePageEvent(newEvent);
      
      // 検証
      expect(component.pageSize()).toBe(20);
      expect(component.currentPage()).toBe(1);
      // fetchDataが呼ばれることで getServiceList が実行される
      expect(mockUserService.getServiceList).toHaveBeenCalledTimes(1); 
    });
  });
  
  // ====================================================================================================
  // ServiceListComponent > openDetail()
  // ====================================================================================================
  describe('openDetail', () => {
    
    // ----------------------------------------------------------------------------------------------------
    // openDetail() > 正常系: サービスIDを渡してダイアログが開かれる
    // ----------------------------------------------------------------------------------------------------
    it('正常系: サービスIDを渡すとMatDialogが開かれ、ダイアログにIDが渡されること', () => {
      const testServiceId = 'test-id-123';
      
      // 実行
      component.openDetail(testServiceId);
      
      // 検証
      expect(mockDialog.open).toHaveBeenCalledTimes(1);
      const args = mockDialog.open.calls.mostRecent().args;
      // 第二引数 (config) の data に serviceId が含まれていることを確認
      expect(args[1]?.data).toEqual({ serviceId: testServiceId }); 
    });
  });
});
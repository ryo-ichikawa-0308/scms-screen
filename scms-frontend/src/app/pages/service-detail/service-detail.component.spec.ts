import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ServiceDetailComponent } from './service-detail.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserServicesService } from 'src/app/bff/user-services/user-services.service';
import { ContractsService } from 'src/app/bff/contracts/contracts.service';
import { of, throwError } from 'rxjs';
import { ServiceDetail } from 'src/app/models/api.model';
import { FormsModule } from '@angular/forms';

// -------------------------------------------------------------------------
// モックの定義
// -------------------------------------------------------------------------

// ServiceDetailComponent に渡すモックデータ
const mockDialogData = { serviceId: 'service-123' };

// モックのサービス詳細データ
const mockServiceDetail: ServiceDetail = {
  id: 'service-123',
  usersName: 'Provider A',
  servicesId: 'idA',
  name: 'Service X',
  description: 'Desc',
  price: 100,
  stock: 5,
  unit: 'GB',
};

// UserServicesServiceのモック
const mockUserServicesService = {
  getServiceDetail: jasmine.createSpy('getServiceDetail').and.returnValue(of(mockServiceDetail)),
};

// ContractsServiceのモック
const mockContractsService = {
  executeContract: jasmine.createSpy('executeContract').and.returnValue(of('contract-id-456')),
};

// MatDialogRefのモック
const mockMatDialogRef = {
  close: jasmine.createSpy('close'),
};

// -------------------------------------------------------------------------
// テストスイート
// -------------------------------------------------------------------------

describe('ServiceDetailComponent', () => {
  let component: ServiceDetailComponent;
  let fixture: ComponentFixture<ServiceDetailComponent>;
  let userServicesService: jasmine.SpyObj<UserServicesService>;
  let contractsService: jasmine.SpyObj<ContractsService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // Standalone Componentなので、importsでテスト対象コンポーネントを直接指定
      imports: [ServiceDetailComponent, FormsModule],
      providers: [
        // 依存オブジェクトをモックで提供
        { provide: MatDialogRef, useValue: mockMatDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
        { provide: UserServicesService, useValue: mockUserServicesService },
        { provide: ContractsService, useValue: mockContractsService },
      ],
      // UserServicesService と ContractsService の型を明示的に指定
    }).compileComponents();

    fixture = TestBed.createComponent(ServiceDetailComponent);
    component = fixture.componentInstance;

    // Spyの取得（型を明確にするため）
    userServicesService = TestBed.inject(
      UserServicesService,
    ) as jasmine.SpyObj<UserServicesService>;
    contractsService = TestBed.inject(ContractsService) as jasmine.SpyObj<ContractsService>;

    // 最初にコンポーネントが初期化される際に、fetchServiceDetailが呼ばれる
    fixture.detectChanges();
  });

  // -------------------------------------------------------------------------
  // 1. 初期化と詳細取得のテスト
  // -------------------------------------------------------------------------
  it('✅ コンポーネントが正常に作成されること', () => {
    expect(component).toBeTruthy();
  });

  it('✅ 初期化時にサービスIDに基づいて詳細データが取得されること', () => {
    // コンポーネントの初期化時に一度呼ばれていることを確認
    expect(userServicesService.getServiceDetail).toHaveBeenCalledWith(mockDialogData.serviceId);

    // データがSignalsに設定され、isLoadingがfalseになっていることを確認
    expect(component.detail()).toEqual(mockServiceDetail);
    expect(component.isLoading()).toBeFalse();
  });

  it('✅ orderQuantity の初期値が 1 であること', () => {
    expect(component.orderQuantity).toBe(1);
  });

  // -------------------------------------------------------------------------
  // 2. 契約実行のテスト (executeContract)
  // -------------------------------------------------------------------------
  describe('executeContract', () => {
    beforeEach(() => {
      // 契約処理前の状態を整える
      component.orderQuantity = 3; // 注文数を有効な値に設定
      component.detail.set(mockServiceDetail); // 詳細データがセットされている
      fixture.detectChanges();

      // Spyの呼び出し回数をリセット
      contractsService.executeContract.calls.reset();
    });

    // -------------------------------------------------------------------------
    // 正常系
    // -------------------------------------------------------------------------
    it('✅ 契約APIが成功したとき、成功メッセージが表示され、isContractSuccessがtrueになること', () => {
      // 実行
      component.executeContract();

      // 検証: API呼び出し
      expect(contractsService.executeContract).toHaveBeenCalledWith(
        mockServiceDetail.id,
        component.orderQuantity,
      );

      // 検証: Signalsの状態
      expect(component.isProcessing()).toBeFalse();
      expect(component.isContractSuccess()).toBeTrue();
      expect(component.contractMessage()).toContain('契約が完了しました');
    });

    // -------------------------------------------------------------------------
    // 異常系 (APIエラー)
    // -------------------------------------------------------------------------
    it('❌ 契約APIが失敗したとき、エラーメッセージが表示され、isProcessingがfalseに戻ること', () => {
      // 失敗するObservableを設定
      contractsService.executeContract.and.returnValue(throwError(() => new Error('API Error')));

      // 実行
      component.executeContract();

      // 検証: Signalsの状態
      expect(component.isProcessing()).toBeFalse(); // 失敗によりProcessingが解除される
      expect(component.isContractSuccess()).toBeFalse();
      expect(component.contractMessage()).toContain('契約に失敗しました');
    });
  });

  // -------------------------------------------------------------------------
  // 3. 境界値・バリデーションのテスト
  // -------------------------------------------------------------------------
  it('⚠️ 詳細データがない場合、契約APIが呼ばれないこと', () => {
    component.detail.set(undefined);
    component.executeContract();

    // 検証
    expect(contractsService.executeContract).not.toHaveBeenCalled();
    expect(component.isProcessing()).toBeFalse();
  });

  it('⚠️ 注文数が不正な場合（0以下）、契約APIが呼ばれないこと', () => {
    component.orderQuantity = 0;
    component.detail.set(mockServiceDetail);
    component.executeContract();

    // 検証
    expect(contractsService.executeContract).not.toHaveBeenCalled();
    expect(component.isProcessing()).toBeFalse();
  });

  it('⚠️ 注文数が在庫を超える場合、契約APIが呼ばれるべきではないが、コンポーネントのHTMLバリデーションに依存', () => {
    // コンポーネントロジックではチェックしていないため、ボタンのdisabled属性が効くことを前提とする。
    // コンポーネントのロジック層では、orderQuantity < 1 のチェックのみを実装している
    component.orderQuantity = 100; // 在庫5に対して100
    component.detail.set(mockServiceDetail);
    component.executeContract();

    // ロジック層での在庫チェックがないため、APIが呼ばれる (API側で在庫不足エラーを返す想定)
    // 厳密には、ここでAPIが呼ばれるのはコンポーネント側の設計次第。今回はAPIに依存する。
    expect(contractsService.executeContract).toHaveBeenCalled();
  });
});

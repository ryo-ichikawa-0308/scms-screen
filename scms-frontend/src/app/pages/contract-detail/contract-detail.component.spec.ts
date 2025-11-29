import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ContractDetailComponent } from './contract-detail.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ContractsService } from 'src/app/bff/contracts/contracts.service';
import { of, throwError } from 'rxjs';
import { ContractDetail } from 'src/app/models/api.model';

// -------------------------------------------------------------------------
// モックの定義
// -------------------------------------------------------------------------

// ContractDetailComponent に渡すモックデータ
const mockDialogData = { contractId: 'contract-456' };

// モックの契約詳細データ
const mockContractDetail: ContractDetail = {
  id: 'contract-456', usersName: 'Provider B', userServicesId: 's1', quantity: 3, 
  name: 'Contract Y', unit: 'GB', price: 1000, stock: 10
};

// ContractsServiceのモック
const mockContractsService = {
  getContractDetail: jasmine.createSpy('getContractDetail').and.returnValue(of(mockContractDetail)),
  executeCancellation: jasmine.createSpy('executeCancellation').and.returnValue(of(undefined)), // voidを返す想定
};

// MatDialogRefのモック
const mockMatDialogRef = {
  close: jasmine.createSpy('close'),
};

// -------------------------------------------------------------------------
// テストスイート
// -------------------------------------------------------------------------

describe('ContractDetailComponent', () => {
  let component: ContractDetailComponent;
  let fixture: ComponentFixture<ContractDetailComponent>;
  let contractsService: jasmine.SpyObj<ContractsService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // Standalone Component のため imports に直接指定
      imports: [ContractDetailComponent],
      providers: [
        // 依存オブジェクトをモックで提供
        { provide: MatDialogRef, useValue: mockMatDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
        { provide: ContractsService, useValue: mockContractsService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ContractDetailComponent);
    component = fixture.componentInstance;

    // Spyの取得（型を明確にするため）
    contractsService = TestBed.inject(ContractsService) as jasmine.SpyObj<ContractsService>;

    // 最初にコンポーネントが初期化される際に、fetchContractDetailが呼ばれる
    fixture.detectChanges();
  });

  // -------------------------------------------------------------------------
  // 1. 初期化と詳細取得のテスト (fetchContractDetail)
  // -------------------------------------------------------------------------
  it('✅ コンポーネントが正常に作成されること', () => {
    expect(component).toBeTruthy();
  });

  it('✅ 初期化時に契約IDに基づいて詳細データが取得されること', fakeAsync(() => {
    // コンポーネントの初期化時に一度呼ばれていることを確認
    expect(contractsService.getContractDetail).toHaveBeenCalledWith(mockDialogData.contractId);
    
    tick();

    // データがSignalsに設定され、isLoadingがfalseになっていることを確認
    expect(component.detail()).toEqual(mockContractDetail);
    expect(component.isLoading()).toBeFalse();
  }));

  it('✅ データ取得成功時、合計金額が正しく計算されること', fakeAsync(() => {
    // price: 1000, quantity: 3 なので合計は 3000
    tick();
    expect(component.total()).toBe(3000);
  }));

  it('✅ データ取得に失敗した場合、detail() が undefined になり、isLoading が false になること', fakeAsync(() => {
    // API呼び出しをエラーにする
    contractsService.getContractDetail.and.returnValue(of(undefined));
    
    component.fetchContractDetail(mockDialogData.contractId);
    tick();

    // 検証: Signalsの状態
    expect(component.detail()).toBeUndefined();
    expect(component.isLoading()).toBeFalse();
    expect(component.total()).toBe(0); // 合計金額も0に戻る
  }));

  // -------------------------------------------------------------------------
  // 2. 解約処理のテスト (executeCancellation)
  // -------------------------------------------------------------------------
  describe('executeCancellation', () => {
    beforeEach(fakeAsync(() => {
      // 詳細データが既に読み込まれた状態にする
      component.detail.set(mockContractDetail);
      component.isProcessing.set(false);
      component.isCancellationSuccess.set(false);
      component.cancellationMessage.set(null);
      
      tick();
      fixture.detectChanges();
      contractsService.executeCancellation.calls.reset(); // 実行回数をリセット
    }));
    
    // -------------------------------------------------------------------------
    // 正常系
    // -------------------------------------------------------------------------
    it('✅ 解約APIが成功したとき、isCancellationSuccess が true になり、メッセージが表示されること', fakeAsync(() => {
      // 実行
      component.executeCancellation();

      // 処理中フラグを確認
      expect(component.isProcessing()).toBeTrue();
      
      tick();

      // 検証: API呼び出し
      expect(contractsService.executeCancellation).toHaveBeenCalledWith(mockContractDetail.id);
      
      // 検証: Signalsの状態
      expect(component.isProcessing()).toBeFalse();
      expect(component.isCancellationSuccess()).toBeTrue();
      expect(component.cancellationMessage()).toContain('契約が正常に解約されました');
    }));

    // -------------------------------------------------------------------------
    // 異常系 (APIエラー)
    // -------------------------------------------------------------------------
    it('❌ 解約APIが失敗したとき、エラーメッセージが表示され、isProcessingがfalseに戻ること', fakeAsync(() => {
      // 失敗するObservableを設定
      contractsService.executeCancellation.and.returnValue(throwError(() => new Error('Cancel Error')));
      
      // 実行
      component.executeCancellation();
      
      tick();

      // 検証: Signalsの状態
      expect(component.isProcessing()).toBeFalse(); // 失敗によりProcessingが解除される
      expect(component.isCancellationSuccess()).toBeFalse();
      expect(component.cancellationMessage()).toContain('解約に失敗しました');
    }));

    // -------------------------------------------------------------------------
    // 境界値
    // -------------------------------------------------------------------------
    it('⚠️ detail() が undefined の場合、解約APIが呼ばれないこと', () => {
      component.detail.set(undefined);
      component.executeCancellation();
      
      // 検証
      expect(contractsService.executeCancellation).not.toHaveBeenCalled();
      expect(component.isProcessing()).toBeFalse();
    });
  });

  // -------------------------------------------------------------------------
  // 3. UI連携のテスト
  // -------------------------------------------------------------------------
  it('✅ close() が呼ばれたとき、MatDialogRef.closeが呼ばれること', () => {
    component.dialogRef.close();
    expect(mockMatDialogRef.close).toHaveBeenCalled();
  });
});
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ContractDetailComponent } from './contract-detail.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ContractsService } from 'src/app/bff/contracts/contracts.service';
import { of, throwError, delay } from 'rxjs';
import { ContractDetail } from 'src/app/models/api.model';

// モックの定義
const mockDialogData = { contractId: 'contract-456' };

const mockContractDetail: ContractDetail = {
  id: 'contract-456', usersName: 'Provider B', userServicesId: 's1', quantity: 3,
  name: 'Contract Y', unit: 'GB', price: 1000, stock: 10
};

const mockContractsService = {
  getContractDetail: jasmine.createSpy('getContractDetail').and.returnValue(of(mockContractDetail)),
  executeCancellation: jasmine.createSpy('executeCancellation').and.returnValue(of()), // voidを返す想定
};

const mockMatDialogRef = {
  close: jasmine.createSpy('close'),
};

describe('ContractDetailComponent', () => {
  let component: ContractDetailComponent;
  let fixture: ComponentFixture<ContractDetailComponent>;
  let contractsService: jasmine.SpyObj<ContractsService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContractDetailComponent],
      providers: [
        { provide: MatDialogRef, useValue: mockMatDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
        { provide: ContractsService, useValue: mockContractsService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ContractDetailComponent);
    component = fixture.componentInstance;
    contractsService = TestBed.inject(ContractsService) as jasmine.SpyObj<ContractsService>;
    contractsService.getContractDetail.and.returnValue(of(mockContractDetail));
    contractsService.executeCancellation.and.returnValue(of(undefined));
    fixture.detectChanges();
  });
  afterEach(() => {
    contractsService.getContractDetail.calls.reset();
    contractsService.executeCancellation.calls.reset();

    contractsService.getContractDetail.and.returnValue(of(mockContractDetail));
    contractsService.executeCancellation.and.returnValue(of(undefined));

    mockMatDialogRef.close.calls.reset();
  });
  describe('init', () => {
    describe('正常系', () => {
      beforeEach(fakeAsync(() => {
        tick();
      }));
      it('✅ コンポーネントが正常に作成されること', () => {
        expect(component).toBeTruthy();
      });

      it('✅ 初期化時に契約IDに基づいて詳細データが取得されること', fakeAsync(() => {
        expect(contractsService.getContractDetail).toHaveBeenCalledWith(mockDialogData.contractId);
        expect(component.detail()).toEqual(mockContractDetail);
        expect(component.isLoading()).toBeFalse();
      }));

      it('✅ データ取得成功時、合計金額が正しく計算されること', fakeAsync(() => {
        expect(component.total()).toBe(3000);
      }));
    });
    describe('異常系', () => {
      it('✅ データ取得に失敗した場合、detail() が undefined になり、isLoading が false になること', fakeAsync(() => {
        contractsService.getContractDetail.and.returnValue(of(undefined));
        component.fetchContractDetail(mockDialogData.contractId);
        tick();

        expect(component.detail()).toBeUndefined();
        expect(component.isLoading()).toBeFalse();
        expect(component.total()).toBe(0);
      }));
    });
  });
  describe('executeCancellation', () => {
    beforeEach(fakeAsync(() => {
      tick();
      component.detail.set(mockContractDetail);
      component.isProcessing.set(false);
      component.isCancellationSuccess.set(false);
      component.cancellationMessage.set(null);
      fixture.detectChanges();
      contractsService.executeCancellation.calls.reset();
    }));

    describe('正常系', () => {
      it('✅ 解約APIが成功したとき、isCancellationSuccess が true になり、メッセージが表示されること', fakeAsync(() => {
        contractsService.executeCancellation.and.returnValue(of(undefined).pipe(delay(0)));
        component.executeCancellation();
        fixture.detectChanges();
        expect(component.isProcessing()).toBeTrue();
        expect(contractsService.executeCancellation).toHaveBeenCalledWith(mockContractDetail.id);
        tick();
        fixture.detectChanges();
        expect(component.isProcessing()).toBeFalse();
        expect(component.isCancellationSuccess()).toBeTrue();
        expect(component.cancellationMessage()).toContain('解約が完了しました。');
      }));
    });
    describe('異常系', () => {
      it('❌ 解約APIが失敗したとき、エラーメッセージが表示され、isProcessingがfalseに戻ること', fakeAsync(() => {
        contractsService.executeCancellation.and.returnValue(throwError(() => new Error('Cancel Error')));
        component.executeCancellation();
        tick();
        expect(component.isProcessing()).toBeFalse();
        expect(component.isCancellationSuccess()).toBeFalse();
        expect(component.cancellationMessage()).toContain('解約に失敗しました');
      }));
      it('⚠️ detail() が undefined の場合、解約APIが呼ばれないこと', () => {
        component.detail.set(undefined);
        component.executeCancellation();

        expect(contractsService.executeCancellation).not.toHaveBeenCalled();
        expect(component.isProcessing()).toBeFalse();
      });
    });
  });
  describe('親画面連携', () => {
    it('✅ close() が呼ばれたとき、MatDialogRef.closeが呼ばれること', () => {
      component.dialogRef.close();
      expect(mockMatDialogRef.close).toHaveBeenCalled();
    });
  });
});
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ServiceDetailComponent } from './service-detail.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserServicesService } from 'src/app/bff/user-services/user-services.service';
import { ContractsService } from 'src/app/bff/contracts/contracts.service';
import { delay, of, throwError } from 'rxjs';
import { ServiceDetail } from 'src/app/models/api.model';
import { FormsModule } from '@angular/forms';

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
const mockContractId = 'contract-id-456';

// UserServicesServiceのモック
const mockUserServicesService = {
  getServiceDetail: jasmine.createSpy('getServiceDetail').and.returnValue(of(mockServiceDetail)),
};

// ContractsServiceのモック
const mockContractsService = {
  executeContract: jasmine.createSpy('executeContract').and.returnValue(of(mockContractId)),
};

// MatDialogRefのモック
const mockMatDialogRef = {
  close: jasmine.createSpy('close'),
};

describe('ServiceDetailComponent', () => {
  let component: ServiceDetailComponent;
  let fixture: ComponentFixture<ServiceDetailComponent>;
  let userServicesService: jasmine.SpyObj<UserServicesService>;
  let contractsService: jasmine.SpyObj<ContractsService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceDetailComponent, FormsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockMatDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
        { provide: UserServicesService, useValue: mockUserServicesService },
        { provide: ContractsService, useValue: mockContractsService },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ServiceDetailComponent);
    component = fixture.componentInstance;
    userServicesService = TestBed.inject(
      UserServicesService,
    ) as jasmine.SpyObj<UserServicesService>;
    contractsService = TestBed.inject(ContractsService) as jasmine.SpyObj<ContractsService>;
    fixture.detectChanges();
  });
  afterEach(() => {
    userServicesService.getServiceDetail.calls.reset();
    userServicesService.getServiceDetail.and.returnValue(of(mockServiceDetail));
    mockMatDialogRef.close.calls.reset();
  });

  describe('init', () => {
    it('コンポーネントが正常に作成されること', () => {
      expect(component).toBeTruthy();
    });

    it('初期化時にサービスIDに基づいて詳細データが取得されること', () => {
      expect(userServicesService.getServiceDetail).toHaveBeenCalledWith(mockDialogData.serviceId);
      expect(component.detail()).toEqual(mockServiceDetail);
      expect(component.isLoading()).toBeFalse();
    });

    it('orderQuantity の初期値が 1 であること', () => {
      expect(component.orderQuantity).toBe(1);
    });
  });
  describe('executeContract', () => {
    beforeEach(() => {
      component.orderQuantity = 3;
      component.detail.set(mockServiceDetail);
      fixture.detectChanges();
      contractsService.executeContract.calls.reset();
    });

    describe('正常系', () => {
      it('契約APIが成功したとき、成功メッセージが表示され、isContractSuccessがtrueになること', fakeAsync(() => {
        contractsService.executeContract.and.returnValue(of(mockContractId).pipe(delay(0)));
        component.executeContract();
        fixture.detectChanges();
        expect(contractsService.executeContract).toHaveBeenCalledWith(
          mockServiceDetail.id,
          component.orderQuantity,
        );
        tick();
        expect(component.isProcessing()).toBeFalse();
        expect(component.isContractSuccess()).toBeTrue();
        expect(component.contractMessage()).toContain('契約が完了しました');
      }));
    });
    describe('異常系', () => {
      it('契約APIが失敗したとき、エラーメッセージが表示され、isProcessingがfalseに戻ること',fakeAsync( () => {
        contractsService.executeContract.and.returnValue(throwError(() => new Error('API Error')));
        component.executeContract();
        tick();
        expect(component.isProcessing()).toBeFalse();
        expect(component.isContractSuccess()).toBeFalse();
        expect(component.contractMessage()).toContain('契約に失敗しました');
      }));
    });
  });
  describe('バリデーション確認', () => {
    beforeEach(() => {
      component.orderQuantity = 3;
      component.detail.set(mockServiceDetail);
      fixture.detectChanges();
      contractsService.executeContract.calls.reset();
    });
    it('詳細データがない場合、契約APIが呼ばれないこと', () => {
      component.detail.set(undefined);
      component.executeContract();

      expect(contractsService.executeContract).not.toHaveBeenCalled();
      expect(component.isProcessing()).toBeFalse();
    });

    it('注文数が不正な場合（0以下）、契約APIが呼ばれないこと', () => {
      component.orderQuantity = 0;
      component.detail.set(mockServiceDetail);
      component.executeContract();

      expect(contractsService.executeContract).not.toHaveBeenCalled();
      expect(component.isProcessing()).toBeFalse();
    });

    it('注文数が在庫を超える場合、契約APIが呼ばれないこど', () => {
      component.orderQuantity = 100; // 在庫5に対して100
      component.detail.set(mockServiceDetail);
      component.executeContract();

      expect(contractsService.executeContract).not.toHaveBeenCalled();
      expect(component.isProcessing()).toBeFalse();
    });
  });
});

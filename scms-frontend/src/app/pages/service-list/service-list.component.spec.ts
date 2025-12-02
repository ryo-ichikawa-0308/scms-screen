import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ServiceListComponent } from './service-list.component';
import { UserServicesService } from 'src/app/bff/user-services/user-services.service';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, Subject, throwError } from 'rxjs';
import { ServiceDetail, PaginatedResponse } from 'src/app/models/api.model';
import { PageEvent } from '@angular/material/paginator';
import { ServiceDetailComponent } from '../service-detail/service-detail.component';
describe('ServiceListComponent', () => {
  let component: ServiceListComponent;
  let fixture: ComponentFixture<ServiceListComponent>;
  let mockUserService: jasmine.SpyObj<UserServicesService>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let dialogCloseSubject: Subject<any>;

  const MOCK_SERVICE_DETAIL: ServiceDetail = {
    id: 's1',
    usersName: 'Provider A',
    servicesId: 'idA',
    name: 'Service X',
    description: 'Desc',
    price: 100,
    stock: 50,
    unit: 'GB',
  };
  const MOCK_PAGINATED_RESPONSE: PaginatedResponse<ServiceDetail> = {
    totalRecords: 1,
    totalPages: 1,
    currentPage: 0,
    offset: 0,
    limit: 10,
    data: [MOCK_SERVICE_DETAIL],
  };

  beforeEach(async () => {
    dialogCloseSubject = new Subject<any>();
    mockUserService = jasmine.createSpyObj('UserServicesService', [
      'getServiceList',
      'getServiceDetail',
    ]);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [ServiceListComponent],
      providers: [
        { provide: UserServicesService, useValue: mockUserService },
        { provide: MatDialog, useValue: mockDialog },
        { provide: MatSnackBar, useValue: { open: () => {} } },
      ],
    })
      .overrideComponent(ServiceListComponent, { remove: { imports: [MatDialogModule] } })
      .compileComponents();

    fixture = TestBed.createComponent(ServiceListComponent);
    component = fixture.componentInstance;
    mockDialog.open.and.returnValue({
      afterClosed: () => dialogCloseSubject.asObservable(),
      close: jasmine.createSpy('close'),
    } as unknown as MatDialogRef<ServiceDetailComponent>);
    mockUserService.getServiceList.and.returnValue(of(MOCK_PAGINATED_RESPONSE));
    mockUserService.getServiceDetail.and.returnValue(of(MOCK_SERVICE_DETAIL));
    fixture.detectChanges();
  });

  afterEach(() => {
    mockUserService.getServiceList.calls.reset();
    mockUserService.getServiceDetail.calls.reset();
  });

  describe('fetchData', () => {
    describe('正常系', () => {
      it('データが正常に取得され、dataSourceとtotalRecordsが更新されること', fakeAsync(() => {
        component.fetchData();
        tick();
        expect(component.isLoading()).toBeFalse();
        expect(component.dataSource()).toEqual(MOCK_PAGINATED_RESPONSE.data);
        expect(component.totalRecords()).toBe(1);
      }));
    });
    describe('異常系', () => {
      it('API呼び出しでエラーが発生した場合、dataSourceは空になり、isLoadingがfalseになること', () => {
        mockUserService.getServiceList.and.returnValue(throwError(() => new Error('API Error')));
        component.fetchData();

        expect(component.isLoading()).toBeFalse();
        expect(component.dataSource()).toEqual([]);
        expect(component.totalRecords()).toBe(0);
      });
    });
  });
  describe('handlePageEvent', () => {
    describe('正常系', () => {
      it('PageEventを受け取り、新しいページサイズとページ番号でfetchDataが呼ばれること', () => {
        mockUserService.getServiceList.calls.reset();
        const newEvent: PageEvent = { pageIndex: 1, pageSize: 20, length: 1 };
        component.handlePageEvent(newEvent);

        expect(component.pageSize()).toBe(20);
        expect(component.currentPage()).toBe(1);
        expect(mockUserService.getServiceList).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('openDetail', () => {
    describe('正常系', () => {
      beforeEach(fakeAsync(() => {
        component.fetchData();
        fixture.detectChanges();
      }));
      it('サービスIDを渡すとMatDialogが開かれ、ダイアログにIDが渡されること', () => {
        const testServiceId = 'test-id-123';
        component.openDetail(testServiceId);            
        expect(mockDialog.open).toHaveBeenCalledWith(ServiceDetailComponent, {
          data: { serviceId: testServiceId },
          width: '90%',
          maxWidth: '500px',
        });
      });
    });
    it('詳細画面クローズ後、fetchDataが再実行されること', fakeAsync(() => {
      const contractId = 'test-contract-id';
      mockUserService.getServiceList.calls.reset();
      component.openDetail(contractId);
      dialogCloseSubject.next(true);
      dialogCloseSubject.complete();
      tick();
      expect(mockUserService.getServiceList).toHaveBeenCalledTimes(1);
      expect(mockUserService.getServiceList).toHaveBeenCalledWith(
        component.searchQuery,
        component.currentPage(),
        component.pageSize(),
      );
    }));

  });
});

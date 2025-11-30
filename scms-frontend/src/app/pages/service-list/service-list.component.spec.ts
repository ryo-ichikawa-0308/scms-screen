import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ServiceListComponent } from './service-list.component';
import { UserServicesService } from 'src/app/bff/user-services/user-services.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { ServiceDetail, PaginatedResponse } from 'src/app/models/api.model';
import { PageEvent } from '@angular/material/paginator';
import { ServiceDetailComponent } from '../service-detail/service-detail.component';
describe('ServiceListComponent', () => {
  let component: ServiceListComponent;
  let fixture: ComponentFixture<ServiceListComponent>;
  let mockUserService: jasmine.SpyObj<UserServicesService>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<ServiceDetailComponent>>;

  const MOCK_SERVICE_DETAIL: ServiceDetail = {
    id: 's1', usersName: 'Provider A', servicesId: 'idA', name: 'Service X',
    description: 'Desc', price: 100, stock: 50, unit: 'GB'
  };
  const MOCK_PAGINATED_RESPONSE: PaginatedResponse<ServiceDetail> = {
    totalRecords: 1, totalPages: 1, currentPage: 0, offset: 0, limit: 10,
    data: [MOCK_SERVICE_DETAIL]
  };

  beforeEach(async () => {
    mockUserService = jasmine.createSpyObj('UserServicesService', ['getServiceList', 'getServiceDetail']);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
    mockDialogRef = jasmine.createSpyObj('ServiceDetailComponent', ['fetchServiceDetail']);

    await TestBed.configureTestingModule({
      imports: [ServiceListComponent],
      providers: [
        { provide: UserServicesService, useValue: mockUserService },
        { provide: MatDialog, useValue: mockDialog },
        { provide: MatSnackBar, useValue: { open: () => { } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ServiceListComponent);
    component = fixture.componentInstance;
    mockDialog.open.and.returnValue(mockDialogRef);
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

        expect(mockDialog.open).toHaveBeenCalledTimes(1);
        const args = mockDialog.open.calls.mostRecent().args;
        expect(args[1]?.data).toEqual({ serviceId: testServiceId });
      });
    });
  });
});
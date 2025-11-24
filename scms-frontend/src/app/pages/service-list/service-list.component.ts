import { Component, signal, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// 共通コンポーネントとモデル
import { UserServicesService } from 'src/app/bff/user-services/user-services.service';
import { ServiceDetail } from 'src/app/models/api.model';
import { ServiceDetailComponent } from 'src/app/pages/service-detail/service-detail.component';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { Subject } from 'rxjs';
@Component({
  selector: 'app-service-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatDialogModule,
  ],
  templateUrl: './service-list.component.html',
  styleUrls: ['./service-list.component.scss'],
})
export class ServiceListComponent implements OnDestroy {
  private serviceListsService = inject(UserServicesService);
  private dialog = inject(MatDialog);
  private destroy$ = new Subject<void>();
  searchQuery: string = '';
  displayedColumns: string[] = ['id', 'name', 'price'];

  dataSource = signal<ServiceDetail[]>([]);
  totalRecords = signal(0);
  currentPage = signal(0);
  pageSize = signal(10);
  isLoading = signal(true);

  constructor() {
     setTimeout(() => this.fetchData(), 0);
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async fetchData(): Promise<void> {
    this.isLoading.set(true);
    const response = await this.serviceListsService.getServiceList(
      this.searchQuery,
      this.currentPage(),
      this.pageSize()
    );
    this.dataSource.set(response.data);
    this.totalRecords.set(response.totalRecords);
    this.isLoading.set(false);
  }

  search(pageIndex: number): void {
    this.currentPage.set(pageIndex);
    this.fetchData();
  }

  handlePageEvent(e: PageEvent): void {
    this.pageSize.set(e.pageSize);
    this.currentPage.set(e.pageIndex);
    this.fetchData();
  }

  openDetail(serviceId: number): void {
    // サービス詳細画面をポップアップ表示
    this.dialog.open(ServiceDetailComponent, {
      data: { serviceId: serviceId },
      width: '90%',
      maxWidth: '500px',
    });
  }
}

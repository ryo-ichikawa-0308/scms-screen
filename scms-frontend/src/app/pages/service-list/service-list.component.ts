import { Component, signal, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserServicesService } from 'src/app/bff/user-services/user-services.service';
import { PaginatedResponse, ServiceDetail } from 'src/app/models/api.model';
import { ServiceDetailComponent } from 'src/app/pages/service-detail/service-detail.component';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { catchError, of, Subject, takeUntil, tap } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
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
  private snackBar = inject(MatSnackBar);
  private destroy$ = new Subject<void>();
  searchQuery: string = '';
  displayedColumns: string[] = ['name', 'usersName', 'price'];

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

  /**
   * サービス一覧を取得する
   */
  fetchData(): void {
    this.isLoading.set(true);     
    this.serviceListsService.getServiceList(
      this.searchQuery,
      this.currentPage(),
      this.pageSize()
    ).pipe(
      takeUntil(this.destroy$),
      tap(() => console.log('データ取得開始')),
      catchError((error) => {
        console.error('APIデータ取得中に重大なエラーが発生しました:', error);
        this.snackBar.open('データ取得に失敗しました。コンソールを確認してください。', '閉じる', { duration: 3000 });
        this.isLoading.set(false);
        this.dataSource.set([]); 
        return of({ 
            totalRecords: 0, 
            totalPages: 0, 
            currentPage: 0, 
            offset: 0, 
            limit: this.pageSize(), 
            data: [] 
        } as PaginatedResponse<ServiceDetail>); 
      })
    ).subscribe(response => {
      this.dataSource.set(response.data);
      this.totalRecords.set(response.totalRecords);
      this.isLoading.set(false);
      console.log('データ取得完了。isLoading:', this.isLoading(), 'データ数:', this.dataSource().length);
    });
  }

  /**
   * ページ番号検索
   * @param pageIndex ページ番号 
   */
  search(pageIndex: number): void {
    this.currentPage.set(pageIndex);
    this.fetchData();
  }

  /**
   * ページング検索
   * @param e ページイベント
   */
  handlePageEvent(e: PageEvent): void {
    this.pageSize.set(e.pageSize);
    this.currentPage.set(e.pageIndex);
    this.fetchData();
  }

  /**
   * サービス詳細画面をポップアップする
   * @param serviceId サービスID
   */
  openDetail(serviceId: string): void {
    // 1. ダイアログを開く
    const dialogRef = this.dialog.open(ServiceDetailComponent, {
      data: { serviceId: serviceId },
      width: '90%',
      maxWidth: '500px',
    });

    // 2. ダイアログが閉じられた後にデータを再取得する
    dialogRef.afterClosed().pipe(
      takeUntil(this.destroy$)
    ).subscribe(result => {
      console.log('ダイアログが閉じられました。結果:', result);
      this.fetchData();
      this.snackBar.open('詳細画面からの戻り: 一覧データを更新しました。', '閉じる', { duration: 2000 });
    });
  }
}

import { Component, inject, OnDestroy, signal } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { ContractsService } from 'src/app/bff/contracts/contracts.service';
import { ContractDetail, PaginatedResponse } from 'src/app/models/api.model';
import { ContractDetailComponent } from 'src/app/pages/contract-detail/contract-detail.component';
import { catchError, of, Subject, takeUntil, tap } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-contract-list',
  standalone: true,
  imports: [
    FormsModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatDialogModule
  ],
  templateUrl: './contract-list.component.html',
  styleUrls: ['./contract-list.component.scss'],
})
export class ContractListComponent implements OnDestroy {
  private contractsService = inject(ContractsService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private destroy$ = new Subject<void>();
  searchQuery: string = '';
  displayedColumns: string[] = ['name', 'usersName', 'quantity'];

  dataSource = signal<ContractDetail[]>([]);
  totalRecords = signal(0);
  currentPage = signal(0);
  pageSize = signal(10);
  isLoading = signal(true);

  constructor() {
    this.fetchData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * 契約一覧を取得する
   */
  fetchData(): void {
    this.isLoading.set(true);
    this.contractsService.getContractList(
      this.searchQuery,
      this.currentPage(),
      this.pageSize()
    ).pipe(
      takeUntil(this.destroy$),
      tap(() => console.log('データ取得開始')),
      catchError(error => {
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
        } as PaginatedResponse<ContractDetail>);
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
   * 契約詳細画面をポップアップする
   * @param contractId 契約ID
   */
  openDetail(contractId: string): void {
    // 1. ダイアログを開く
    const dialogRef = this.dialog.open(ContractDetailComponent, {
      data: { contractId: contractId },
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

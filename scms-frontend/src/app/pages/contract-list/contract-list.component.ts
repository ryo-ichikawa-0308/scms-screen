import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { ContractDetail } from 'src/app/models/api.model';
import { ContractDetailComponent } from 'src/app/pages/contract-detail/contract-detail.component';

@Component({
  selector: 'app-contract-list',
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
  templateUrl: './contract-list.component.html',
  styleUrls: ['./contract-list.component.scss'],
})
export class ContractListComponent {
  private contractsService = inject(ContractsService);
  private dialog = inject(MatDialog);

  searchQuery: string = '';
  displayedColumns: string[] = ['id', 'name', 'orderQuantity', 'status'];

  dataSource = signal<ContractDetail[]>([]);
  totalRecords = signal(0);
  currentPage = signal(0);
  pageSize = signal(10);
  isLoading = signal(true);

  constructor() {
    this.fetchData();
  }

  async fetchData(): Promise<void> {
    this.isLoading.set(true);
    const response = await this.contractsService.getContractList(
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

  openDetail(contractId: string): void {
    // 契約詳細画面をポップアップ表示
    this.dialog.open(ContractDetailComponent, {
      data: { contractId: contractId },
      width: '90%',
      maxWidth: '500px',
    });
  }
}

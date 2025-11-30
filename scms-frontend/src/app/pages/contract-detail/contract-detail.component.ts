import { Component, inject, signal } from '@angular/core';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

import { ContractsService } from 'src/app/bff/contracts/contracts.service';
import { ContractDetail } from 'src/app/models/api.model';
import { catchError, of, tap } from 'rxjs';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-contract-detail-dialog',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatCardModule, DecimalPipe,],
  templateUrl: './contract-detail.component.html',
  styleUrls: ['./contract-detail.component.scss'],
})
export class ContractDetailComponent {
  private contractsService = inject(ContractsService);
  public dialogRef = inject(MatDialogRef<ContractDetailComponent>);
  public data: { contractId: string } = inject(MAT_DIALOG_DATA);

  detail = signal<ContractDetail | undefined>(undefined);
  total = signal(0);
  isLoading = signal(true);
  isProcessing = signal(false);
  cancellationMessage = signal<string | null>(null);
  isCancellationSuccess = signal(false);

  constructor() {
    this.fetchContractDetail(this.data.contractId);
  }

  /**
   * 契約詳細検索
   * @param id 契約ID
   */
  fetchContractDetail(id: string): void {
    this.isLoading.set(true);
    this.contractsService
      .getContractDetail(id)
      .subscribe((result) => {
        this.detail.set(result);
        this.total.set((result?.price ?? 0) * (result?.quantity ?? 0));
        this.isLoading.set(false);
      });
  }

  /**
   * 解約
   * @returns void
   */
  executeCancellation(): void {
    if (!this.detail()) return;

    this.isProcessing.set(true); // 解約ボタンを不活化
    this.cancellationMessage.set(null);
    const contractId = this.detail()!.id || '';
    const serviceName = this.detail()!.name || '';

    this.contractsService
      .executeCancellation(contractId)
      .pipe(
        catchError((error) => {
          console.error(error);
          this.cancellationMessage.set('解約に失敗しました。時間をおいて再度お試しください。');
          this.isCancellationSuccess.set(false);
          this.isProcessing.set(false); // 失敗時はボタンを再活性化
          return of();
        }),
      )
      .subscribe((result) => {
        console.log('contract: ', result);
        this.cancellationMessage.set(`解約が完了しました。サービス: ${serviceName}`);
        this.isCancellationSuccess.set(true);
        this.isProcessing.set(false);
      });
  }
}

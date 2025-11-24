import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

import { ContractsService } from 'src/app/bff/contracts/contracts.service';
import { ContractDetail } from 'src/app/models/api.model';

@Component({
  selector: 'app-contract-detail-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatCardModule],
  templateUrl: './contract-detail.component.html',
  styleUrls: ['./contract-detail.component.scss'],
})
export class ContractDetailComponent {
  private contractsService = inject(ContractsService);
  public dialogRef = inject(MatDialogRef<ContractDetailComponent>);
  public data: { contractId: string } = inject(MAT_DIALOG_DATA);

  detail = signal<ContractDetail | undefined>(undefined);
  isLoading = signal(true);
  isProcessing = signal(false);
  cancellationMessage = signal<string | null>(null);
  isCancellationSuccess = signal(false);

  constructor() {
    this.fetchContractDetail(this.data.contractId);
  }

  async fetchContractDetail(id: string): Promise<void> {
    this.isLoading.set(true);
    this.detail.set(await this.contractsService.getContractDetail(id));
    this.isLoading.set(false);
  }

  async executeCancellation(): Promise<void> {
    if (!this.detail()) return;

    this.isProcessing.set(true); // 解約ボタンを不活化
    this.cancellationMessage.set(null);
    const contractId = this.detail()!.id || '';

    const success = await this.contractsService.executeCancellation(contractId);

    if (success) {
      this.cancellationMessage.set(`解約が完了しました。契約ID: ${contractId}`);
      this.isCancellationSuccess.set(true);
      this.isProcessing.set(false);
    } else {
      this.cancellationMessage.set('解約に失敗しました。時間をおいて再度お試しください。');
      this.isCancellationSuccess.set(false);
      this.isProcessing.set(false); // 失敗時はボタンを再活性化
    }
  }
}

import { Component, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import {MatDialogModule} from '@angular/material/dialog';

import { UserServicesService } from 'src/app/bff/user-services/user-services.service';
import { ContractsService } from 'src/app/bff/contracts/contracts.service';
import { ServiceDetail } from 'src/app/models/api.model';

@Component({
  selector: 'app-service-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DecimalPipe,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatDialogModule,
  ],
  templateUrl: './service-detail.component.html',
  styleUrls: ['./service-detail.component.scss'],
})
export class ServiceDetailComponent {
  private userServicesService = inject(UserServicesService);
  private contractsService = inject(ContractsService);
  public dialogRef = inject(MatDialogRef<ServiceDetailComponent>);
  public data: { serviceId: string } = inject(MAT_DIALOG_DATA);

  detail = signal<ServiceDetail | undefined>(undefined);
  orderQuantity: number = 1;
  isLoading = signal(true);
  isProcessing = signal(false);
  contractMessage = signal<string | null>(null);
  isContractSuccess = signal(false);

  constructor() {
    this.fetchServiceDetail(this.data.serviceId);
  }

  async fetchServiceDetail(id: string): Promise<void> {
    this.isLoading.set(true);
    const result = await this.userServicesService.getServiceDetail(id);
    this.detail.set(result);
    this.isLoading.set(false);

    // 在庫がない場合は注文数を0に設定
    if (result && result.stock === 0) {
      this.orderQuantity = 0;
    }
  }

  async executeContract(): Promise<void> {
    if (!this.detail() || this.orderQuantity < 1) return;

    this.isProcessing.set(true); // 契約ボタンを不活化
    this.contractMessage.set(null);
    const serviceId = this.detail()!.id || '';
    const quantity = this.orderQuantity;

    const success = await this.contractsService.executeContract(serviceId, quantity);

    if (success) {
      this.contractMessage.set(`契約が完了しました。サービスID: ${serviceId}, 数量: ${quantity}`);
      this.isContractSuccess.set(true);
      // 成功しても処理中はボタン不活化のまま
    } else {
      this.contractMessage.set('契約に失敗しました。時間をおいて再度お試しください。');
      this.isContractSuccess.set(false);
      this.isProcessing.set(false); // 失敗時はボタンを再活性化
    }
    this.isProcessing.set(false); // 処理完了
  }
}

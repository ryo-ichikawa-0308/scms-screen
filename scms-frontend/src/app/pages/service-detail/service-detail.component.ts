import { Component, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { UserServicesService } from 'src/app/bff/user-services/user-services.service';
import { ContractsService } from 'src/app/bff/contracts/contracts.service';
import { ServiceDetail } from 'src/app/models/api.model';
import { catchError, of, tap } from 'rxjs';

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

  /**
   * サービス詳細検索
   * @param id ユーザー提供サービスID
   */
  fetchServiceDetail(id: string): void {
    this.isLoading.set(true);
    this.userServicesService
      .getServiceDetail(id)
      .subscribe((result) => {
        this.detail.set(result);
        this.isLoading.set(false);
      });
  }

  /**
   * サービス契約
   * @returns void
   */
  executeContract(): void {
    if (
      !this.detail() ||
      this.orderQuantity == null ||
      this.orderQuantity < 1 ||
      this.orderQuantity > (this.detail()?.stock ?? 0)
    )
      return;

    this.isProcessing.set(true); // 契約ボタンを不活化
    this.contractMessage.set(null);
    const serviceId = this.detail()!.id || '';
    const quantity = this.orderQuantity;
    const serviceName = this.detail()!.name || '';

    this.contractsService
      .executeContract(serviceId, quantity)
      .pipe(
        catchError((error) => {
          console.error(error);
          this.contractMessage.set('契約に失敗しました。時間をおいて再度お試しください。');
          this.isContractSuccess.set(false);
          this.isProcessing.set(false); // 失敗時はボタンを再活性化
          return of();
        }),
      )
      .subscribe((result) => {
        console.log('contract: ', result);
        this.contractMessage.set(
          `契約が完了しました。サービス名: ${serviceName}, 数量: ${quantity}`,
        );
        this.isContractSuccess.set(true);
      });
    this.isProcessing.set(false); // 処理完了
  }
}

import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// 共通コンポーネントとモデル
import { UserServicesService } from 'src/app/bff/user-services/user-services.service';
import { PagingConfig } from 'src/app/models/page-config.model';
import { ServiceDetail } from 'src/app/models/api.model';
import { ServiceDetailComponent } from 'src/app/pages/service-detail/service-detail.component';
@Component({
  selector: 'app-service-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ServiceDetailComponent,
  ],
  templateUrl: './service-list.component.html',
  styleUrls: ['./service-list.component.scss'],
})
export class ServiceListComponent implements OnInit {
  private serviceListsService = inject(UserServicesService);

  // --- 検索フォームの状態 ---
  serviceName = signal<string>('');

  // --- リストグリッドとページングの状態 ---
  data = signal<ServiceDetail[]>([]);
  pagingConfig = signal<PagingConfig>({
    totalItems: 0,
    currentPage: 1,
    itemsPerPage: 10,
    maxPageLinks: 5,
  });

  // --- モーダルの状態 ---
  isModalOpen = signal(false);
  selectedServiceDetail = signal<ServiceDetail | null>(null);

  ngOnInit(): void {
    // 画面ロード時に検索条件なしで検索を実行
    this.searchServices();
  }

  /**
   * 検索ボタン押下、または画面ロード時にサービス検索を実行する
   * @param newPage 検索するページ番号 (ページング時のみ使用)
   */
  async searchServices(newPage: number = 1): Promise<void> {
    const searchName = this.serviceName();
    const itemsPerPage = this.pagingConfig().itemsPerPage;
    const startIndex = (newPage - 1) * itemsPerPage;

    // 検索条件オブジェクトを作成 (ServiceListsServiceが期待する形式に合わせる)
    const searchCondition = { name: searchName };
    const result = await this.serviceListsService.getServiceList(
      searchCondition.name,
      startIndex,
      itemsPerPage,
    );

    // 状態を更新
    this.data.set(result.data);
    this.pagingConfig.set({
      ...this.pagingConfig(),
      totalItems: result.totalRecords,
      currentPage: newPage,
    });

    console.log(`検索実行: サービス名='${searchCondition.name}', ページ=${newPage}`);
  }

  /**
   * リストグリッドからページ変更イベントを受け取る
   * @param newPage 新しいページ番号
   */
  onPageChange(newPage: number): void {
    this.searchServices(newPage);
  }

  /**
   * リストグリッドのレコードクリックイベントハンドラ
   * @param serviceId クリックされたレコードのID
   */
  onRecordClick(serviceId: string): void {
    console.log(`サービスID: ${serviceId} の詳細を表示`);

    const serviceDetail = this.data().find((s) => String(s.id) === serviceId) || null;

    if (serviceDetail) {
      this.selectedServiceDetail.set(serviceDetail);
      this.isModalOpen.set(true);
    }
  }

  /**
   * モーダルを閉じる
   */
  closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedServiceDetail.set(null);
  }
}

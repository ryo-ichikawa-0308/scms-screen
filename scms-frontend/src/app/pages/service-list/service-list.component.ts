import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// 共通コンポーネントとモデル
import { HeaderComponent } from 'src/app/components/header/header.component';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { HamburgerMenuComponent } from 'src/app/components/hamburger-menu/hamburger-menu.component';
import { ListGridComponent, GridHeader } from 'src/app/components/list-grid/list-grid.component';
import { ServiceListsService } from 'src/app/core/service-lists/service-lists.service';
import { PagingConfig } from 'src/app/models/page-config.model';
import { Service } from 'src/app/models/service.model';
import { MenuItem } from 'src/app/models/hamburger-menu.model';
@Component({
  selector: 'app-service-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HeaderComponent,
    ButtonComponent,
    HamburgerMenuComponent,
    ListGridComponent,
  ],
  templateUrl: './service-list.html',
  styleUrls: ['./service-list.scss'],
})
export class ServiceListComponent implements OnInit {
  private serviceListsService = inject(ServiceListsService);
  private router = inject(Router);

  // --- 検索フォームの状態 ---
  searchServiceName = signal({ name: '' });

  // --- リストグリッドとページングの状態 ---
  data = signal<Service[]>([]);
  pagingConfig = signal<PagingConfig>({
    totalItems: 0,
    currentPage: 1,
    itemsPerPage: 10,
    maxPageLinks: 5,
  });

  // --- モーダルの状態 ---
  isModalOpen = signal(false);
  selectedServiceDetail = signal<Service | null>(null);

  // --- リストグリッドのヘッダー定義 ---
  gridHeaders: GridHeader<Service>[] = [
    { key: 'id', label: 'ID', hidden: true },
    { key: 'name', label: 'サービス名' },
    { key: 'description', label: '概要' },
    { key: 'price', label: '単価' },
    { key: 'unit', label: '単位' },
  ];

  // --- ハンバーガーメニュー設定 ---
  // ログイン状態はモックとして true を設定
  isLoggedIn = signal(true);

  // サービス一覧へのリンク設定
  serviceLinkConfig: MenuItem = {
    label: 'サービス一覧ページ',
    iconKey: 'service',
    action: () => {
      console.log('サービス一覧へ');
    },
  };

  // 契約一覧へのリンク設定
  contractLinkConfig: MenuItem = {
    label: '契約一覧ページへ',
    iconKey: 'contract',
    action: () => {
      void this.router.navigate(['/contract-list']);
    },
  };

  ngOnInit(): void {
    // 画面ロード時に検索条件なしで検索を実行
    this.searchServices();
  }

  /**
   * 検索ボタン押下、または画面ロード時にサービス検索を実行する
   * @param newPage 検索するページ番号 (ページング時のみ使用)
   */
  searchServices(newPage: number = 1): void {
    const searchCondition = this.searchServiceName();
    const itemsPerPage = this.pagingConfig().itemsPerPage;
    const startIndex = (newPage - 1) * itemsPerPage;

    // ServiceServiceからデータを取得 (ここではモックデータを使用)
    const result = this.serviceListsService.getServiceList(
      searchCondition,
      startIndex,
      itemsPerPage,
    );

    // 状態を更新
    this.data.set(result.data);
    this.pagingConfig.set({
      ...this.pagingConfig(),
      totalItems: result.pagingConfig.totalItems,
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

    // IDに基づいて詳細データを取得 (ここではモック)
    const serviceDetail = this.data().find((s) => s.id === serviceId) || null;

    if (serviceDetail) {
      this.selectedServiceDetail.set(serviceDetail);
      this.isModalOpen.set(true); // モーダルを開く
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

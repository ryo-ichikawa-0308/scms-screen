import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // ページ番号の直接入力用

// 設定をまとめるための型定義
export interface PagingConfig {
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  maxPageLinks: number;
}

@Component({
  selector: 'app-paging',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './paging.component.html',
  styleUrls: ['./paging.component.scss'],
})
export class PagingComponent implements OnChanges {
  @Input() totalItems: number = 0;
  @Input() currentPage: number = 1;
  @Input() itemsPerPage: number = 10;
  @Input() maxPageLinks: number = 5;

  @Output() pageChange = new EventEmitter<number>();

  // 算出したプロパティ
  totalPages: number = 1; // 最終ページ番号
  pageLinks: number[] = []; // 表示するページ番号の配列
  maxM: number = 0; // ロジックで使用するM (maxPageLinks / 2 以下の最大の整数)
  jumpPage: number = 1; // ページ番号指定ジャンプ用

  // ページ遷移ボタンの画像URL (上書き可能にするためInputと併用)
  @Input() firstPageIcon: string = '«';
  @Input() prevPageIcon: string = '‹';
  @Input() nextPageIcon: string = '›';
  @Input() lastPageIcon: string = '»';

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['totalItems'] ||
      changes['itemsPerPage'] ||
      changes['currentPage'] ||
      changes['maxPageLinks']
    ) {
      this.calculatePaging();
    }
  }

  /**
   * ページ番号リンクと最終ページ番号を計算する
   */
  calculatePaging(): void {
    if (this.totalItems <= 0 || this.itemsPerPage <= 0) {
      this.totalPages = 1;
      this.pageLinks = [];
      this.currentPage = 1;
      return;
    }

    // 最終ページ番号の計算 (切り上げ)
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);

    // 現在のページが有効範囲外であれば修正
    this.currentPage = Math.min(Math.max(1, this.currentPage), this.totalPages);

    // ロジックで使用するMの計算 (maxPageLinks / 2 以下の最大の整数)
    this.maxM = Math.floor(this.maxPageLinks / 2);

    let startPage: number;
    let endPage: number;

    // A. totalPages が maxPageLinks 以下の場合は全表示
    if (this.totalPages <= this.maxPageLinks) {
      startPage = 1;
      endPage = this.totalPages;
    }
    // B. currentPage が M 以下の場合: 1からmaxPageLinksの固定表示
    else if (this.currentPage <= this.maxM) {
      startPage = 1;
      endPage = this.maxPageLinks;
    }
    // C. currentPage が 最終ページ番号 - M 以上の場合: 最終ページから遡って固定表示
    else if (this.currentPage >= this.totalPages - this.maxM) {
      startPage = this.totalPages - this.maxPageLinks + 1;
      endPage = this.totalPages;
    }
    // D. それ以外の場合 (変動表示): currentPage - M から currentPage + M
    else {
      startPage = this.currentPage - this.maxM;
      endPage = this.currentPage + this.maxM;
    }

    // リンク配列の生成
    this.pageLinks = [];
    for (let i = startPage; i <= endPage; i++) {
      this.pageLinks.push(i);
    }

    // ページジャンプの初期値設定
    this.jumpPage = this.currentPage;
  }

  /**
   * ページ遷移を親コンポーネントに通知する
   */
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }
    this.pageChange.emit(page);
  }

  /**
   * ページ番号指定ジャンプを実行する
   */
  jumpToPage(): void {
    const pageNum = Number(this.jumpPage);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= this.totalPages) {
      this.goToPage(pageNum);
    }
  }
}

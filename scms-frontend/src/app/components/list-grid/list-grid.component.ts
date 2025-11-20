import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PagingComponent, PagingConfig } from '../paging/paging.component';

// ヘッダー定義の型を拡張
export interface GridHeader {
  key: string;
  label: string;
  hidden?: boolean; // 新規追加: trueの場合、列を非表示にする
}

@Component({
  selector: 'app-list-grid',
  standalone: true,
  imports: [CommonModule, PagingComponent],
  templateUrl: './list-grid.component.html',
  styleUrls: ['./list-grid.component.scss'],
})
export class ListGridComponent<T extends object> {
  @Input() data: T[] = [];

  // 拡張された型を使用
  @Input() headers: GridHeader[] = [];

  @Input() pagingConfig!: PagingConfig;

  // 新規追加: レコードクリック時に値を取得するためのキーを指定
  @Input() keyField: keyof T | '' = '';

  // レコードクリックイベント。keyFieldの値(IDなど)を返す。
  @Output() recordClick = new EventEmitter<T[keyof T] | T>();
  @Output() pageChange = new EventEmitter<number>();

  // テンプレートで表示するヘッダーのみをフィルタリング
  get visibleHeaders(): GridHeader[] {
    return this.headers.filter((header) => !header.hidden);
  }

  /**
   * レコードがクリックされたときにイベントを発火
   */
  onRecordClick(item: T): void {
    if (this.keyField && item[this.keyField] !== undefined) {
      // keyFieldが指定されている場合、その値を発火
      this.recordClick.emit(item[this.keyField]);
    } else {
      // keyFieldがない場合はレコード全体を発火 (フォールバック)
      this.recordClick.emit(item);
    }
  }

  onPageChange(newPage: number): void {
    this.pageChange.emit(newPage);
  }
}

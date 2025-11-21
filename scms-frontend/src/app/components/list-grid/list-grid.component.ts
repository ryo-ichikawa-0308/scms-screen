import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PagingComponent, PagingConfig } from 'src/app/components/paging/paging.component';

// ヘッダー定義の型を拡張
export interface GridHeader<T extends object> {
  key: keyof T;
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
  // 入力プロパティ
  @Input({ required: true }) data: T[] = [];
  @Input({ required: true }) headers!: GridHeader<T>[];
  @Input({ required: true }) pagingConfig!: PagingConfig;

  // 修正: keyFieldの型は keyof T または string を受け入れる
  @Input({ required: true }) keyField!: keyof T | string;

  // 出力イベント: クリックされたレコードのIDを出力 (string型に修正)
  @Output() recordClick = new EventEmitter<string>();

  // 出力イベント: ページング変更
  @Output() pageChange = new EventEmitter<number>();

  get visibleHeaders(): GridHeader<T>[] {
    return this.headers ? this.headers.filter((h) => !h.hidden) : [];
  }

  /**
   * Tのキーの型ガード
   * @param obj チェック対象のオブジェクト
   * @param key チェック対象のキー (string)
   * @returns キーがTの有効なキーであり、オブジェクト自身がそのプロパティを持っている場合にtrue
   */
  isKeyOfT(obj: T, key: string | keyof T): key is keyof T {
    if (typeof key === 'string') {
      return Object.prototype.hasOwnProperty.call(obj, key);
    }
    return false;
  }

  /**
   * 行がクリックされたときの処理
   * @param record クリックされたレコードデータ
   */
  handleRecordClick(record: T): void {
    const key = this.keyField;

    if (this.isKeyOfT(record, key)) {
      const value = record[key];

      this.recordClick.emit(String(value));
    } else {
      console.warn(`ListGrid: keyField '${String(key)}' not found in record.`);
    }
  }

  onPageChange(newPage: number): void {
    this.pageChange.emit(newPage);
  }
}

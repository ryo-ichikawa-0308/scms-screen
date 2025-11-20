import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DetailItem {
  label: string;
  value: string | number | object;
  key: string; // 内部的なキー（IDなど）
  hidden?: boolean; // trueの場合、行全体を非表示にする
}

@Component({
  selector: 'app-table-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table-grid.component.html',
  styleUrls: ['./table-grid.component.scss'],
})
export class TableGridComponent {
  @Input() data: DetailItem[] = [];
  @Input() title: string = '詳細情報';

  // 親コンポーネントがアクセスしやすいように、非表示キー項目を格納するプロパティ
  public hiddenKeys: { [key: string]: any } = {};

  // テンプレートで表示する項目のみをフィルタリング
  get visibleData(): DetailItem[] {
    // 描画前に hiddenKeys を更新しつつ、表示項目のみを返す
    this.hiddenKeys = {};
    return this.data.filter((item: DetailItem) => {
      if (item.hidden && item.key) {
        // 非表示かつキーが設定されている場合は hiddenKeys に格納
        this.hiddenKeys[item.key] = item.value;
      }
      return !item.hidden;
    });
  }
}

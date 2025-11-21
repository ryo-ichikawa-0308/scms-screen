import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { Service } from 'src/app/models/service.model';

@Component({
  selector: 'app-service-detail',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './service-detail.html',
  styleUrls: ['./service-detail.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush, // パフォーマンス最適化
})
export class ServiceDetailComponent {
  // 親コンポーネントから表示する詳細データを受け取る
  // Service型は外部（data.model）で定義されている前提
  @Input({ required: true }) serviceDetail: Service | null = null;

  // モーダルを閉じるイベントを親コンポーネントに送出する
  @Output() closeModal = new EventEmitter<void>();

  constructor() {}

  handleClose(): void {
    this.closeModal.emit();
  }
}

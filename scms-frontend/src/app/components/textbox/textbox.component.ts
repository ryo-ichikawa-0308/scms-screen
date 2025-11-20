import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-textbox',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './textbox.component.html',
  styleUrls: ['./textbox.component.scss'],
})
export class TextboxComponent {
  // 親コンポーネントから受け取る値
  @Input() label: string = '';
  @Input() type: 'text' | 'password' | 'email' = 'text';
  @Input() placeholder: string = '';

  // フォームコントロールの値 (ngModelとバインド)
  @Input() value: string = '';

  // 親コンポーネントに変更を通知するためのイベント
  @Output() valueChange = new EventEmitter<string>();

  // 値が変更されたときに親コンポーネントに通知するメソッド
  onInputChange(newValue: string): void {
    this.value = newValue; // 内部値を更新
    this.valueChange.emit(newValue); // 親コンポーネントにイベントを発火
  }
}

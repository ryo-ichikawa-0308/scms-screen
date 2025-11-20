import { Component, Input, Output, EventEmitter } from '@angular/core';
@Component({
  selector: 'app-button',
  standalone: true,
  imports: [],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
})
export class ButtonComponent {
  @Input() text: string = 'ボタン';
  @Output() clickEvent = new EventEmitter<void>();
  onClick(): void {
    this.clickEvent.emit();
  }
}

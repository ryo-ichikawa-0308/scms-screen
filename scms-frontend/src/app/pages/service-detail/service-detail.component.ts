import { Component } from '@angular/core';
import { FooterComponent } from 'src/app/components/footer/footer.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { LabelComponent } from 'src/app/components/label/label.component';

@Component({
  selector: 'service-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HeaderComponent,
    FooterComponent,
    ButtonComponent,
    LabelComponent,
  ],
  templateUrl: './service-detail.html',
  styleUrls: ['./service-detail.scss'],
})
export class ServiceDetailComponent {
  // メッセージ表示用プロパティ
  errorMessage: string | null = null;
  isError: boolean = false;
}

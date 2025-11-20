import { Component } from '@angular/core';
import { FooterComponent } from '../../components/footer/footer.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../components/button/button.component';
import { HeaderComponent } from '../../components/header/header.component';
import { LabelComponent } from '../../components/label/label.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HeaderComponent,
    FooterComponent,
    ButtonComponent,
    LabelComponent,
  ],
  templateUrl: './contract-detail.html',
  styleUrls: ['./contract-detail.scss'],
})
export class ContractDetailComponent {}

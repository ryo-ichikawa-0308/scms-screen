import { Component } from '@angular/core';
import { FooterComponent } from 'src/app/components/footer/footer.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { LabelComponent } from 'src/app/components/label/label.component';

@Component({
  selector: 'contract-detail',
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

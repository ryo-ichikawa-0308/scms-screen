import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // [(ngModel)] のために必要
import { Router } from '@angular/router'; // 画面遷移のために必要
import { CommonModule } from '@angular/common'; // *ngIf のために必要

// 作成/既存のコンポーネントとサービスをインポート
import { AuthService } from '../../core/auth/auth.service';
import { HeaderComponent } from '../../components/header/header.component'; 
import { FooterComponent } from '../../components/footer/footer.component';
import { ButtonComponent } from '../../components/button/button.component'; 
import { LabelComponent } from '../../components/label/label.component'; 
// TextboxComponentは、ここでは標準のinputタグを使用します

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
  templateUrl: './login.html',
  styleUrls: ['./login.scss'] 
})
export class LoginComponent {
  // フォームデータとバインドするプロパティ
  email: string = '';
  password: string = '';
  
  // メッセージ表示用プロパティ
  errorMessage: string | null = null;
  isError: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * ログインボタン押下時のイベントハンドラ
   */
  handleLogin(): void {
    this.errorMessage = null; // エラーメッセージをリセット
    this.isError = false;

    // 簡易バリデーション
    if (!this.email || !this.email) {
      this.errorMessage = 'ユーザーIDとパスワードを入力してください。';
      this.isError = true;
      return;
    }

    const credentials = {
      email: this.email,
      password: this.password
    };

    // 認証サービスを呼び出し
    this.authService.login(credentials).subscribe({
      next: () => {
        // ログイン成功: サービス一覧画面へ遷移
        // NOTE: ルーティングパスは app.routes.ts で定義されたものに修正してください
        this.router.navigate(['/service-list']); 
      },
      error: (err) => {
        // ログイン失敗
        console.error('ログイン処理中にエラーが発生しました', err);
        
        // エラーメッセージの表示
        // バックエンドからのエラーメッセージがあればそれを優先し、なければ汎用メッセージを表示
        this.errorMessage = err.error?.message || 'ログインに失敗しました。ユーザーIDまたはパスワードをご確認ください。';
        this.isError = true;
      }
    });
  }
}
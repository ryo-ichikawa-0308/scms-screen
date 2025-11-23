import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/bff/auth/auth.service';
import { LoginRequest } from 'src/app/models/api.model';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorPayload } from 'src/app/models/api.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
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
    private router: Router,
  ) {}

  /**
   * ログインボタン押下時のイベントハンドラ
   */
  handleLogin(): void {
    this.errorMessage = null;
    this.isError = false;

    // 簡易バリデーション
    if (!this.email || !this.password) {
      this.errorMessage = 'ユーザーIDとパスワードを入力してください。';
      this.isError = true;
      return;
    }

    const credentials: LoginRequest = {
      email: this.email,
      password: this.password,
    };

    this.authService.login(credentials).subscribe({
      next: () => {
        // ログイン成功: サービス一覧画面へ遷移
        void this.router.navigate(['/main-page/service-list']);
      },
      error: (err: HttpErrorResponse) => {
        // ログイン失敗
        console.error('ログイン処理中にエラーが発生しました', err);

        // エラーメッセージの表示
        const apiError = err.error as ErrorPayload;

        this.errorMessage =
          apiError?.message ||
          'ログインに失敗しました。ユーザーIDまたはパスワードをご確認ください。';
        this.isError = true;
      },
    });
  }
}

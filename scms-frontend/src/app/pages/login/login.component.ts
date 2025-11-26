import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from 'src/app/bff/auth/auth.service';
import { LoginRequest } from 'src/app/models/api.model';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorPayload } from 'src/app/models/api.model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule
],

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
  isLoading: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

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

    this.isLoading = true;

    const credentials: LoginRequest = {
      email: this.email,
      password: this.password,
    };

    this.authService.login(credentials).subscribe({
      next: () => {
        // ログイン成功: サービス一覧画面へ遷移
        this.isLoading = false;
        void this.router.navigate(['/main-page/service-list']);
      },
      error: (err: HttpErrorResponse) => {
        // ログイン失敗
        this.isLoading = false;
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

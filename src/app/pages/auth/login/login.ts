import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth';
import { finalize } from 'rxjs';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { PasswordModule } from '@openng/optimus-ui/password';
import { ButtonModule } from '@openng/optimus-ui/button';
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '../../../services/toast';
import { HttpErrorResponse } from '@angular/common/http';
import { DialogModule } from '@openng/optimus-ui/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  imports: [ReactiveFormsModule, FormsModule, InputTextModule, PasswordModule, ButtonModule, RouterLink, DialogModule],
  selector: 'app-login',
  styleUrl: './login.scss',
  templateUrl: './login.html',
})
export class Login {
  authSrv = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  forgotPasswordVisible = false;
  isSendingReset = signal(false);
  forgotPasswordError = signal('');
  forgotPasswordForm = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
  });

  openForgotPassword(): void {
    if (this.isSendingReset()) return;
    this.forgotPasswordForm.reset({ email: this.loginForm.controls.email.value ?? '' });
    this.forgotPasswordError.set('');
    this.forgotPasswordVisible = true;
  }

  submitForgotPassword(): void {
    if (this.isSendingReset()) return;
    this.forgotPasswordError.set('');
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsDirty();
      return;
    }

    this.isSendingReset.set(true);
    this.authSrv.forgotPassword(this.forgotPasswordForm.getRawValue())
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.isSendingReset.set(false)))
      .subscribe({
        next: () => {
          this.forgotPasswordVisible = false;
          this.forgotPasswordForm.reset();
          this.toast.showSuccess('Check your email for a password reset link.');
        },
        error: () => this.forgotPasswordError.set('Unable to request a password reset. Please try again.'),
      });
  }

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  })

  isLoggingIn = signal(false);
  loginError = signal('');
  submit() {
    if (this.isLoggingIn()) return;

    this.loginError.set('');
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsDirty();
      return
    }

    this.isLoggingIn.set(true)
    let value = this.loginForm.value;
    let data = {
      email: value.email!,
      password: value.password!,
    };

    this.authSrv.login(data)
    .pipe(finalize(() => this.isLoggingIn.set(false)))
    .subscribe({
      next: () => {
        this.toast.showSuccess('Logged in successfully.');
        void this.router.navigate(['/rooms']);
      },
      error: (error: HttpErrorResponse) => {
        const body = error.error;
        const message = typeof body === 'string' ? body : body?.message ?? body?.error;
        if (message === 'Email is not confirmed') {
          const guidance = 'Click the verification link in your email to confirm your account, then try logging in again.';
          this.loginError.set(guidance);
          this.toast.showWarning(guidance);
          return;
        }
        this.loginError.set('Unable to log in. Check your details and try again.');
      },
    })

  }
}

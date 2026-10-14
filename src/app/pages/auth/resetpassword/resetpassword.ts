import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PasswordModule } from '@openng/optimus-ui/password';
import { ButtonModule } from '@openng/optimus-ui/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { AuthService } from '../../../services/auth';
import { ResetPasswordRequest } from '../../../interfaces/auth';

@Component({
  imports: [RouterLink, ReactiveFormsModule, PasswordModule, ButtonModule],
  selector: 'app-resetpassword',
  styleUrl: './resetpassword.scss',
  templateUrl: './resetpassword.html',
})
export class Resetpassword {
  private route = inject(ActivatedRoute);
  private authSrv = inject(AuthService);
  private destroyRef = inject(DestroyRef);
  isResetting = signal(false);
  resetComplete = signal(false);
  resetError = signal('');
  readonly linkError = !this.route.snapshot.queryParamMap.get('email')?.trim() ||
    !this.route.snapshot.queryParamMap.get('token')?.trim()
    ? 'This reset link is incomplete. Open the password reset link in your email.' : '';

  resetForm = new FormGroup({
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    confirmPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  }, {
    validators: (form) => form.get('password')?.value === form.get('confirmPassword')?.value
      ? null : { passwordMismatch: true },
  });

  submit(): void {
    if (this.linkError || this.isResetting() || this.resetComplete()) return;
    this.resetError.set('');
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsDirty();
      return;
    }

    const data: ResetPasswordRequest = {
      ...this.resetForm.getRawValue(),
      email: this.route.snapshot.queryParamMap.get('email')!,
      token: this.route.snapshot.queryParamMap.get('token')!,
    };
    this.isResetting.set(true);
    this.authSrv.resetPassword(data)
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.isResetting.set(false)))
      .subscribe({
        next: () => {
          this.resetForm.reset();
          this.resetComplete.set(true);
        },
        error: () => this.resetError.set('Unable to reset your password. Check your reset link and try again.'),
      });
  }
}

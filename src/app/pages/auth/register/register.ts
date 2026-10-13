import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { PasswordModule } from '@openng/optimus-ui/password';
import { ButtonModule } from '@openng/optimus-ui/button';
import { AuthService } from '../../../services/auth';
import { RegisterData } from '../../../interfaces/auth';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../services/toast';

@Component({
  imports: [ReactiveFormsModule, InputTextModule, PasswordModule, ButtonModule, RouterLink],
  selector: 'app-register',
  styleUrl: './register.scss',
  templateUrl: './register.html',
})
export class Register {
  authSrv = inject(AuthService);
  private toast = inject(ToastService);

  registerForm = new FormGroup({
    username: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    confirmPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  }, {
    validators: (form) => form.get('password')?.value === form.get('confirmPassword')?.value
      ? null
      : { passwordMismatch: true },
  });

  isRegistering = signal(false);
  registerError = signal('');
  registrationSuccess = signal(false);

  submit() {
    if (this.isRegistering()) return;

    this.registerError.set('');
    this.registrationSuccess.set(false);
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsDirty();
      return;
    }

    const data: RegisterData = this.registerForm.getRawValue();
    this.isRegistering.set(true);
    this.authSrv.register(data)
      .pipe(finalize(() => this.isRegistering.set(false)))
      .subscribe({
        next: () => {
          this.registerForm.reset();
          this.registrationSuccess.set(true);
          this.toast.showSuccess('Your account has been created. You can now log in.');
        },
        error: () => {
          this.registerError.set('Unable to create your account. Check your details and try again.');
        },
      });
  }
}

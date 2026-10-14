import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, distinctUntilChanged, finalize, map, of, switchMap } from 'rxjs';
import { AuthService } from '../../../services/auth';

@Component({
  imports: [RouterLink],
  selector: 'app-email-confirmation',
  styleUrl: './email-confirmation.scss',
  templateUrl: './email-confirmation.html',
})
export class EmailConfirmation implements OnInit {
  private authSrv = inject(AuthService);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  isConfirming = signal(false);
  confirmed = signal(false);
  confirmationError = signal('');

  ngOnInit(): void {
    this.route.queryParamMap.pipe(
      map((params) => ({ email: params.get('email') ?? '', token: params.get('token') ?? '' })),
      distinctUntilChanged((previous, current) => previous.email === current.email && previous.token === current.token),
      switchMap(({ email, token }) => {
        this.confirmed.set(false);
        this.confirmationError.set('');
        if (!email.trim() || !token.trim()) {
          this.confirmationError.set('This confirmation link is incomplete. Open the verification link in your email.');
          return of(false);
        }

        this.isConfirming.set(true);
        return this.authSrv.confirmEmail(email, token).pipe(
          map(() => true),
          catchError(() => {
            this.confirmationError.set('Unable to confirm your email. Check that you opened the full verification link, then refresh this page to try again.');
            return of(false);
          }),
          finalize(() => this.isConfirming.set(false)),
        );
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((confirmed) => this.confirmed.set(confirmed));
  }
}

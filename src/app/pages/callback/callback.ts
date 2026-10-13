import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, distinctUntilChanged, finalize, map, of, switchMap } from 'rxjs';
import { Payment } from '../../services/payment';
import { PaymentVerifyResponse } from '../../interfaces/payment';

@Component({
  imports: [RouterLink],
  selector: 'app-callback',
  styleUrl: './callback.scss',
  templateUrl: './callback.html',
})
export class Callback implements OnInit {
  private route = inject(ActivatedRoute);
  private paymentSrv = inject(Payment);
  private destroyRef = inject(DestroyRef);
  isVerifying = signal(false);
  result = signal<PaymentVerifyResponse | null>(null);
  verificationError = signal('');

  ngOnInit(): void {
    this.route.queryParamMap.pipe(
      map((params) => params.get('reference')?.trim() ?? ''),
      distinctUntilChanged(),
      switchMap((reference) => {
        this.result.set(null);
        this.verificationError.set('');
        if (!reference) {
          this.verificationError.set('The payment reference is missing. Open the callback link provided after payment.');
          return of(null);
        }

        this.isVerifying.set(true);
        return this.paymentSrv.verify(reference).pipe(
          catchError(() => {
            this.verificationError.set('Unable to verify your payment. Refresh this page to try again.');
            return of(null);
          }),
          finalize(() => this.isVerifying.set(false)),
        );
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((result) => this.result.set(result));
  }
}

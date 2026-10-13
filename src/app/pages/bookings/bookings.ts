import { Component, DestroyRef, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { ButtonModule } from '@openng/optimus-ui/button';
import { BookingResult } from '../../interfaces/booking';
import { environment } from '../../../environments/environment.development';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { Payment } from '../../services/payment';

@Component({
  imports: [DatePipe, DecimalPipe, ButtonModule],
  selector: 'app-bookings',
  styleUrl: './bookings.scss',
  templateUrl: './bookings.html',
})
export class Bookings {
  bookings = httpResource<BookingResult[]>(() => `${environment.baseUrl}/api/Bookings/MyBookings`);
  private paymentSrv = inject(Payment);
  private destroyRef = inject(DestroyRef);
  initializingBookingId = signal<string | null>(null);
  paymentUrls = signal<Record<string, string>>({});
  paymentErrors = signal<Record<string, string>>({});

  initializePayment(booking: BookingResult): void {
    if (booking.isPaid || this.initializingBookingId() || this.paymentUrls()[booking.bookingId]) return;

    const bookingId = booking.bookingId;
    this.paymentErrors.update((errors) => ({ ...errors, [bookingId]: '' }));
    this.initializingBookingId.set(bookingId);
    this.paymentSrv.initialize({ bookingId })
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.initializingBookingId.set(null)))
      .subscribe({
        next: (response) => {
          try {
            const url = new URL(response.authorizationUrl);
            if (url.protocol !== 'https:') throw new Error('Invalid payment URL');
            this.paymentUrls.update((urls) => ({ ...urls, [bookingId]: url.href }));
          } catch {
            this.paymentErrors.update((errors) => ({
              ...errors, [bookingId]: 'Payment setup returned an invalid link. Please try again.',
            }));
          }
        },
        error: () => {
          this.paymentErrors.update((errors) => ({
            ...errors, [bookingId]: 'Unable to prepare payment. Please try again.',
          }));
        },
      });
  }
}

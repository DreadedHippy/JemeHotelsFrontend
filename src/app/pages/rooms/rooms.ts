import { Component, computed, DestroyRef, DOCUMENT, inject, signal } from '@angular/core';
import { RoomService } from '../../services/room';
import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { ButtonModule } from '@openng/optimus-ui/button';
import { DialogModule } from '@openng/optimus-ui/dialog';
import { DatePickerModule } from '@openng/optimus-ui/datepicker';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { BookingService } from '../../services/booking';
import { ToastService } from '../../services/toast';
import { Room } from '../../interfaces/room';
import { Booking, BookingResponse } from '../../interfaces/booking';
import { Payment } from '../../services/payment';
import { PaymentInitializeResponse } from '../../interfaces/payment';

@Component({
  imports: [DecimalPipe, TitleCasePipe, ButtonModule, DialogModule, DatePickerModule, ReactiveFormsModule],
  selector: 'app-rooms',
  styleUrl: './rooms.scss',
  templateUrl: './rooms.html',
})
export class Rooms {
  roomSrv = inject(RoomService)

  rooms = computed(() => this.roomSrv.rooms.hasValue() ? this.roomSrv.rooms.value():[]);

  private bookingSrv = inject(BookingService);
  private paymentSrv = inject(Payment);
  private window = inject(DOCUMENT).defaultView;
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);
  selectedRoom = signal<Room | null>(null);
  bookingDialogVisible = false;
  isBooking = signal(false);
  bookingError = signal('');
  bookedRoom = signal<BookingResponse | null>(null);
  payment = signal<PaymentInitializeResponse | null>(null);
  isInitializingPayment = signal(false);
  paymentError = signal('');

  bookingForm = new FormGroup({
    startDate: new FormControl<Date | null>(null, Validators.required),
    endDate: new FormControl<Date | null>(null, Validators.required),
  }, {
    validators: (form) => {
      const start = form.get('startDate')?.value;
      const end = form.get('endDate')?.value;
      if (!start || !end) return null;
      return start instanceof Date && end instanceof Date &&
        Number.isFinite(start.getTime()) && Number.isFinite(end.getTime()) && end > start
        ? null : { invalidDateRange: true };
    },
  });

  openBooking(room: Room): void {
    console.log("Opening booking");
    if (this.isBooking() || this.isInitializingPayment()) return;
    this.selectedRoom.set(room);
    this.bookingForm.reset();
    this.bookingError.set('');
    this.bookedRoom.set(null);
    this.payment.set(null);
    this.paymentError.set('');
    this.bookingDialogVisible = true;
  }

  submitBooking(): void {
    const room = this.selectedRoom();
    if (!room || this.isBooking() || this.bookedRoom()) return;
    this.bookingError.set('');
    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsDirty();
      return;
    }

    const { startDate, endDate } = this.bookingForm.getRawValue();
    const data: Booking = {
      roomId: room.roomID,
      startDate: this.formatDate(startDate!),
      endDate: this.formatDate(endDate!),
    };
    this.isBooking.set(true);
    this.bookingSrv.bookRoom(data)
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.isBooking.set(false)))
      .subscribe({
        next: (booking) => {
          this.bookedRoom.set(booking);
          this.toast.showSuccess(`Room ${room.roomNumber} booked successfully.`);
          this.initializePayment();
        },
        error: () => {
          this.bookingError.set('Unable to book this room. Please try again.');
        },
      });
  }

  initializePayment(): void {
    const booking = this.bookedRoom();
    if (!booking || this.isInitializingPayment() || this.payment()) return;

    this.paymentError.set('');
    this.isInitializingPayment.set(true);
    this.paymentSrv.initialize({ bookingId: booking.id })
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.isInitializingPayment.set(false)))
      .subscribe({
        next: (response) => {
          try {
            const url = new URL(response.authorizationUrl);
            if (url.protocol !== 'https:') throw new Error('Invalid payment URL');
            this.payment.set(response);
          } catch {
            this.paymentError.set('Payment setup returned an invalid link. Please try again.');
          }
        },
        error: () => {
          this.paymentError.set('Your booking was created, but payment setup failed. Please try again.');
        },
      });
  }

  payForBooking(): void {
    const payment = this.payment();
    if (payment) {
      this.window?.open(payment.authorizationUrl, '_blank', 'noopener,noreferrer');
    }
  }

  private formatDate(date: Date): string {
    return date.toISOString();
  }
}

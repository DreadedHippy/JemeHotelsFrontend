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
import { AddRoom, Room } from '../../interfaces/room';
import { AuthService } from '../../services/auth';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { InputNumberModule } from '@openng/optimus-ui/inputnumber';
import { SelectModule } from '@openng/optimus-ui/select';
import { Booking, BookingResponse } from '../../interfaces/booking';
import { Payment } from '../../services/payment';
import { PaymentInitializeResponse } from '../../interfaces/payment';

@Component({
  imports: [DecimalPipe, TitleCasePipe, ButtonModule, DialogModule, DatePickerModule, ReactiveFormsModule,
    InputTextModule, InputNumberModule, SelectModule],
  selector: 'app-rooms',
  styleUrl: './rooms.scss',
  templateUrl: './rooms.html',
})
export class Rooms {
  roomSrv = inject(RoomService)
  private authSrv = inject(AuthService);
  isAdmin = computed(() => this.authSrv.role() === 'Admin');
  canBook = computed(() => this.authSrv.role() === 'User');
  addRoomDialogVisible = false;
  isAddingRoom = signal(false);
  addRoomError = signal('');
  imageError = signal('');
  roomTypes = [
    { label: 'Basic', value: 'basic' },
    { label: 'Ensuite', value: 'Ensuite' },
  ];
  addRoomForm = new FormGroup({
    roomNumber: new FormControl<number | null>(null, [Validators.required, Validators.min(101), Validators.max(120),
      (control) => control.value === null || Number.isInteger(control.value) ? null : { integer: true }]),
    roomType: new FormControl<AddRoom['roomType']>('basic', { nonNullable: true, validators: [Validators.required] }),
    price: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
    Images: new FormControl<AddRoom['Images'] | null>(null, Validators.required),
  });

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
    if (!this.authSrv.isAuthenticated() || !this.canBook()) return;
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
    if (!this.authSrv.isAuthenticated() || !this.canBook()) return;
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
    if (!this.authSrv.isAuthenticated() || !this.canBook()) return;
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
    if (!this.authSrv.isAuthenticated() || !this.canBook()) return;
    const payment = this.payment();
    if (payment) {
      this.window?.open(payment.authorizationUrl, '_blank', 'noopener,noreferrer');
    }
  }

  openAddRoom(): void {
    if (!this.authSrv.isAuthenticated() || !this.isAdmin() || this.isAddingRoom()) return;
    this.addRoomForm.reset();
    this.addRoomError.set('');
    this.imageError.set('');
    this.addRoomDialogVisible = true;
  }

  selectRoomImage(event: Event): void {
    const files = Array.from((event.target as HTMLInputElement).files ?? []);
    const validImages = files.length > 0 && files.every((file) => file.type.startsWith('image/'));
    this.addRoomForm.controls.Images.setValue(validImages ? files : null);
    this.addRoomForm.controls.Images.markAsDirty();
    this.imageError.set(files.length > 0 && !validImages ? 'Choose only image files.' : '');
  }

  submitAddRoom(): void {
    if (!this.authSrv.isAuthenticated() || !this.isAdmin() || this.isAddingRoom()) return;
    this.addRoomError.set('');
    if (this.addRoomForm.invalid) {
      this.addRoomForm.markAllAsDirty();
      return;
    }
    const value = this.addRoomForm.getRawValue();
    const data: AddRoom = {
      roomNumber: value.roomNumber!,
      roomType: value.roomType,
      price: value.price!,
      Images: value.Images!,
    };
    this.isAddingRoom.set(true);
    this.roomSrv.addRoom(data)
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.isAddingRoom.set(false)))
      .subscribe({
        next: () => {
          this.addRoomDialogVisible = false;
          this.toast.showSuccess(`Room ${data.roomNumber} added successfully.`);
          this.roomSrv.rooms.reload();
        },
        error: () => this.addRoomError.set('Unable to add the room. Check the details and try again.'),
      });
  }

  private formatDate(date: Date): string {
    return date.toISOString();
  }
}

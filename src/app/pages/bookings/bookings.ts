import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { ButtonModule } from '@openng/optimus-ui/button';
import { AdminBookingResult, BookingResult } from '../../interfaces/booking';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { SelectModule } from '@openng/optimus-ui/select';
import { environment } from '../../../environments/environment.development';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { Payment } from '../../services/payment';
import { AuthService } from '../../services/auth';
import { BookingService } from '../../services/booking';

@Component({
  imports: [DatePipe, DecimalPipe, ButtonModule, FormsModule, InputTextModule, SelectModule],
  selector: 'app-bookings',
  styleUrl: './bookings.scss',
  templateUrl: './bookings.html',
})
export class Bookings {
  private auth = inject(AuthService);
  private bookingSrv = inject(BookingService);
  isAdmin = computed(() => this.auth.role() === 'Admin');
  bookings = httpResource<BookingResult[]>(() => this.auth.role() === 'User'
    ? `${environment.baseUrl}/api/Bookings/MyBookings` : undefined);
  adminBookings = rxResource({
    params: () => this.isAdmin() ? true : undefined,
    stream: () => this.bookingSrv.getAllBookings(),
  });
  isLoading = computed(() => this.isAdmin() ? this.adminBookings.isLoading() : this.bookings.isLoading());
  loadError = computed(() => this.isAdmin() ? this.adminBookings.error() : this.bookings.error());
  private paymentSrv = inject(Payment);
  private destroyRef = inject(DestroyRef);
  initializingBookingId = signal<string | null>(null);
  paymentUrls = signal<Record<string, string>>({});
  paymentErrors = signal<Record<string, string>>({});
  searchQuery = signal('');
  paymentFilter = signal<'all' | 'paid' | 'unpaid'>('all');
  sortBy = signal<'original' | 'id' | 'bill' | 'duration' | 'room' | 'date'>('original');
  sortDirection = signal<'asc' | 'desc'>('asc');
  paymentOptions = [
    { label: 'All payments', value: 'all' },
    { label: 'Paid', value: 'paid' },
    { label: 'Unpaid', value: 'unpaid' },
  ];
  directionOptions = [
    { label: 'Ascending', value: 'asc' },
    { label: 'Descending', value: 'desc' },
  ];
  sortOptions = computed(() => [
    { label: 'Original order', value: 'original' },
    { label: 'Booking ID', value: 'id' },
    { label: 'Total bill', value: 'bill' },
    { label: 'Duration', value: 'duration' },
    this.isAdmin() ? { label: 'Room number', value: 'room' } : { label: 'Start date', value: 'date' },
  ]);
  hasFilters = computed(() => this.searchQuery().trim() !== '' || this.paymentFilter() !== 'all');
  filteredBookings = computed(() => this.filterAndSort(
    this.bookings.hasValue() ? this.bookings.value() : [],
    (booking) => `${booking.bookingId} ${booking.startDate}`,
  ));
  filteredAdminBookings = computed(() => this.filterAndSort(
    this.adminBookings.hasValue() ? this.adminBookings.value() : [],
    (booking) => `${booking.Id} ${booking.roomNumber} ${booking.guestUserName}`,
  ));
  resultCount = computed(() => this.isAdmin() ? this.filteredAdminBookings().length : this.filteredBookings().length);

  resetControls(): void {
    this.searchQuery.set('');
    this.paymentFilter.set('all');
    this.sortBy.set('original');
    this.sortDirection.set('asc');
  }

  private filterAndSort<T extends BookingResult | AdminBookingResult>(items: T[], searchText: (item: T) => string): T[] {
    const query = this.searchQuery().trim().toLowerCase();
    const payment = this.paymentFilter();
    const filtered = items.filter((item) => (!query || searchText(item).toLowerCase().includes(query)) &&
      (payment === 'all' || item.isPaid === (payment === 'paid')));
    if (this.sortBy() === 'original') return filtered;

    const direction = this.sortDirection() === 'asc' ? 1 : -1;
    return filtered.sort((left, right) => {
      const a = this.sortValue(left);
      const b = this.sortValue(right);
      const comparison = typeof a === 'number' && typeof b === 'number'
        ? a - b : String(a).localeCompare(String(b), undefined, { numeric: true });
      return direction * comparison;
    });
  }

  private sortValue(booking: BookingResult | AdminBookingResult): string | number {
    switch (this.sortBy()) {
      case 'bill': return booking.totalBill;
      case 'duration': return booking.numberOfDays;
      case 'room': return 'roomNumber' in booking ? booking.roomNumber : 0;
      case 'date': {
        const date = 'startDate' in booking ? Date.parse(booking.startDate) : 0;
        return Number.isFinite(date) ? date : 0;
      }
      default: return 'bookingId' in booking ? booking.bookingId : booking.Id;
    }
  }

  reloadBookings(): void {
    if (this.isAdmin()) this.adminBookings.reload();
    else this.bookings.reload();
  }

  initializePayment(booking: BookingResult): void {
    if (!this.auth.isAuthenticated() || this.auth.role() !== 'User') return;
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

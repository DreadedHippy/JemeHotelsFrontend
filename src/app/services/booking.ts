import { inject, Service } from '@angular/core';
import { AdminBookingResult, Booking, BookingResponse } from '../interfaces/booking';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';

@Service()
export class BookingService {
  http = inject(HttpClient);

  bookRoom(data: Booking) {
    return this.http.post<BookingResponse>(`${environment.baseUrl}/api/Bookings`, data)
  }

  getAllBookings() {
    return this.http.get<AdminBookingResult[]>(`${environment.baseUrl}/api/Bookings`)
  }
}

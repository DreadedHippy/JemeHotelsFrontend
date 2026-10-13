import { inject, Service } from '@angular/core';
import { Booking, BookingResponse } from '../interfaces/booking';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';

@Service()
export class BookingService {
  http = inject(HttpClient);

  bookRoom(data: Booking) {
    return this.http.post<BookingResponse>(`${environment.baseUrl}/api/Bookings`, data)
  }
}

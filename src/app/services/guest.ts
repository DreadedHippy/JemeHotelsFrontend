import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';
import { GuestResult } from '../interfaces/guest';

@Service()
export class Guest {
  http = inject(HttpClient);

  retrieveGuests(pageNumber: number, pageSize: number): Observable<GuestResult[]> {
    return this.http.get<GuestResult[]>(`${environment.baseUrl}/api/Guests?pageNumber=${pageNumber}&pageSize=${pageSize}`)
  }

  elevateGuestToAdmin(username: string): Observable<{message: string}> {
    const data = {
      username,
      role: 'Admin'
    }

    return this.http.post<{message: string}>(`${environment.baseUrl}/api/Auth/assign-role`, data);

  }
}

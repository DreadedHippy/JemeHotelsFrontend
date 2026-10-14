import { HttpClient, HttpHeaders, httpResource } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { AddRoom, AddRoomResponse, Room } from '../interfaces/room';
import { Observable } from 'rxjs';

@Service()
export class RoomService {
  rooms = httpResource<Room[]>(() => `${environment.baseUrl}/api/Rooms`)
  http = inject(HttpClient);

  headers = new HttpHeaders({
    'ngrok-skip-browser-warning': 'true'
  })

  addRoom(data: AddRoom): Observable<AddRoomResponse> {
    const formData = new FormData();
    formData.append('roomNumber', String(data.roomNumber));
    formData.append('roomType', data.roomType);
    formData.append('price', String(data.price));
    for (const image of data.Images) {
      formData.append('Images', image, image.name);
    }

    console.log(formData);
    return this.http.post<AddRoomResponse>(`${environment.baseUrl}/api/Rooms`, formData);
  }

}

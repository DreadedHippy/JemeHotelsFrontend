import { HttpClient, HttpHeaders, httpResource } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Room } from '../interfaces/room';

@Service()
export class RoomService {
  rooms = httpResource<Room[]>(() => `${environment.baseUrl}/api/Rooms`)
  http = inject(HttpClient);

  headers = new HttpHeaders({
    'ngrok-skip-browser-warning': 'true'
  })

}

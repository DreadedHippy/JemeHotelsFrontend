export interface Room {
  roomID: string;
  roomNumber: number;
  roomType: 'basic' | 'Ensuite';
  price: number;
  image: string;
}

export interface AddRoom {
  roomNumber: number;
  roomType: 'basic' | 'Ensuite';
  price: number;
  Images: File[];
}

export interface AddRoomResponse {
  roomID: string;
  roomNumber: number;
  roomType: 'basic' | 'Ensuite';
  price: number;
}

export interface Room {
  roomID: string;
  roomNumber: number;
  roomType: 'basic' | 'Ensuite';
  price: number;
  image: string;
}

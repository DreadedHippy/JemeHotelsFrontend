export interface Booking {
  roomId: string;
  startDate: string;
  endDate: string;
}

export interface BookingResponse {
  id: string;
  numberOfDays: number;
  totalBill: number;
}

export interface BookingResult {
  bookingId: string;
  startDate: string;
  numberOfDays: number;
  totalBill: number;
  isPaid: boolean;
}
export interface AdminBookingResult {
  Id: string;
  numberOfDays: number;
  totalBill: number;
  roomNumber: number;
  roomId: string;
  isPaid: boolean;
  guestId: string;
  guestUserName: string;
  roomType: string;
}

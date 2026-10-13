import { Routes } from '@angular/router';
import { Login } from './pages/auth/login/login';
import { Register } from './pages/auth/register/register';
import { Rooms } from './pages/rooms/rooms';
import { authGuard } from './guards/auth-guard';
import { Bookings } from './pages/bookings/bookings';
import { Callback } from './pages/callback/callback';

export const routes: Routes = [
  {
    path: 'callback',
    component: Callback
  },
  {
    path: 'bookings',
    component: Bookings,
    canActivate: [authGuard]
  },
  {
    path: 'rooms',
    component: Rooms,
    canActivate: [authGuard]
  },
  {
    path: 'register',
    component: Register
  },
  {
    path: 'login',
    component: Login
  }
];

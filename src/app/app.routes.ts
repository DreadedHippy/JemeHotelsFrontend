import { Routes } from '@angular/router';
import { Login } from './pages/auth/login/login';
import { Register } from './pages/auth/register/register';
import { Rooms } from './pages/rooms/rooms';
import { authGuard } from './guards/auth-guard';
import { Bookings } from './pages/bookings/bookings';
import { Callback } from './pages/callback/callback';
import { Guest } from './pages/guest/guest';
import { adminGuard } from './guards/admin-guard';
import { EmailConfirmation } from './pages/auth/email-confirmation/email-confirmation';
import { Resetpassword } from './pages/auth/resetpassword/resetpassword';

export const routes: Routes = [
  {
    path: 'resetpassword',
    component: Resetpassword
  },
  {
    path: 'confirm-email',
    component: EmailConfirmation
  },
  {
    path: 'guest',
    component: Guest,
    canActivate: [adminGuard]
  },
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

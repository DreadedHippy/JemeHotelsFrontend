import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';
import { environment } from '../../environments/environment.development';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  req = req.clone({ setHeaders: { 'ngrok-skip-browser-warning': 'true' } });

  const server = new URL(environment.baseUrl);
  const url = new URL(req.url, server);
  const serverPath = server.pathname.replace(/\/$/, '');
  if (url.origin !== server.origin ||
      (url.pathname !== serverPath && !url.pathname.startsWith(`${serverPath}/`))) {
    return next(req);
  }

  const jwtToken = inject(AuthService).getToken();
  if (jwtToken) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${jwtToken}` } });
  }
  return next(req);
};

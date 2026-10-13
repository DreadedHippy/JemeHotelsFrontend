import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideOptimus } from '@openng/optimus-ui/config';
import Nora from '@openng/optimus-ui-themes/nora';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { MessageService } from '@openng/optimus-ui/api';
import { AuthService } from './services/auth';
import { authInterceptor } from './interceptors/auth-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAppInitializer(() => inject(AuthService).autoAuthenticate()),
    MessageService,
    provideOptimus({
      theme: {
        preset: Nora,
        options: {
          darkModeSelector: false || 'none'
        }
      }
    }),
  ],
};

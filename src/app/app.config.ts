import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';


import { routes } from './app.routes';
import { provideServiceWorker } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes), 
    provideHttpClient(),
    MatIconModule,
    provideServiceWorker('service-worker.js', {
            enabled: true,
            registrationStrategy: 'registerWhenStable:30000'
          })
  ]
};

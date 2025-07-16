import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
// import { provideServiceWorker } from '@angular/service-worker';
// import { provideHttpClient } from '@angular/common/http';
// import { environment } from './environments/environment';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));

// bootstrapApplication(App, {
//   providers: [
//     provideHttpClient(),
//     environment.production ? provideServiceWorker('service-worker.js') : [],
//   ],
// });

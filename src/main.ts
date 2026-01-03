import { bootstrapApplication } from '@angular/platform-browser';
//import { appConfig } from './app/app.config';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { App } from './app/app';

bootstrapApplication(App, {
  providers: [
    provideHttpClient()
  ]
})
  .catch((err) => console.error(err));
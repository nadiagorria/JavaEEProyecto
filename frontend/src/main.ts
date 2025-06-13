import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { appConfig } from './app/app.config';
import { ApplicationConfig } from '@angular/core';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

const themeConfig = {
  providers: [
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: false  // fuerza modo claro
        }
      }
    })
  ]
};

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    ...appConfig.providers,
    ...themeConfig.providers  
  ]
}).catch((err) => console.error(err));

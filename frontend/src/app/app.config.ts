import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';

import Aura from '@primeng/themes/aura';

import { routes } from './app.routes';
import { ErrorInterceptor } from 'src/interceptors/error.interceptor';
import { NetworkInterceptor } from 'src/interceptors/network.interceptor';
import { AuthInterceptor } from 'src/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
              provideZoneChangeDetection({ eventCoalescing: true }),
              provideHttpClient(
                    withFetch(),
                    withInterceptors([
                      AuthInterceptor, 
                      ErrorInterceptor, 
                      NetworkInterceptor])
              ),
              provideRouter(routes),
              provideAnimationsAsync(),
              providePrimeNG({
                theme: {
                  preset: Aura
                },
              })
            ]
};

import { inject, Injectable } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { SecurityService } from '../services/security.service';
export const ErrorInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(SecurityService);
  const router = inject(Router);
  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logout();
        router.navigateByUrl('/login');
      } else if (error.status === 403) {
        const isAuthEndpoint =
          request.url.includes('/seguridad/') ||
          request.url.includes('/auth/') ||
          request.url.includes('/login');

        if (isAuthEndpoint) {
          authService.logout();
          router.navigateByUrl('/login');
        }
      }
      return throwError(() => error);
    })
  );
};

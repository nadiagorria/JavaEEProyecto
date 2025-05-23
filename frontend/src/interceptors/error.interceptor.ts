import { inject, Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { SecurityService } from '../services/security.service'; // Adjust the import path as necessary
// assuming AuthService is where you handle authentication

export const ErrorInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(SecurityService);
  const router = inject(Router);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 403 || error.status === 401) { // Only handle HTTP 403 errors
        authService.logout();
        router.navigateByUrl('/login');
      }
      return throwError(() => error); // Use a factory function for `throwError`
    })
  );
};

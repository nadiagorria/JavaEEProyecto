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
      if (error.status === 401) {
        // 401 = No autenticado - siempre cerrar sesión
        authService.logout();
        router.navigateByUrl('/login');
      } else if (error.status === 403) {
        // 403 = Autenticado pero sin permisos
        // Solo cerrar sesión si es un endpoint de autenticación
        const isAuthEndpoint = request.url.includes('/seguridad/') || 
                              request.url.includes('/auth/') ||
                              request.url.includes('/login');
        
        if (isAuthEndpoint) {
          authService.logout();
          router.navigateByUrl('/login');
        }
        // Si no es endpoint de autenticación, solo propagar el error
      }
      return throwError(() => error);
    })
  );
};

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

export const AuthInterceptor: HttpInterceptorFn = (request, next) => {
  const token = localStorage.getItem('token');
  
  if (token) {
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(request);
};
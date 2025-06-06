import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

export const AuthInterceptor: HttpInterceptorFn = (request, next) => {
  const token = localStorage.getItem('token');
  
  console.log('AuthInterceptor ejecutado para URL:', request.url);
  console.log('Token encontrado:', token ? 'Sí' : 'No');
  
  if (token) {
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Header Authorization agregado:', `Bearer ${token.substring(0, 20)}...`);
  }

  return next(request);
};
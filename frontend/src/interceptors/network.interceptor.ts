import { finalize } from 'rxjs';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { CargandoService } from '../services/cargando.service';


export const NetworkInterceptor: HttpInterceptorFn = (request, next) => {
  const loader = inject(CargandoService);

  // Show the loader
  loader.show();

  return next(request).pipe(
    // Hide the loader when the request is complete
    finalize(() => {
      loader.hide();
    })
  );
};

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, interval } from 'rxjs';
import { UrlService } from './url.service';
import { SecurityService } from './security.service';
import { NotificacionUsuarioDto } from '../models/notificacion-usuario.dto';

export interface ResponseListadoNotificacionUsuario {
  notificacionUsuarios: NotificacionUsuarioDto[];
}

@Injectable({
  providedIn: 'root',
})
export class NotificacionService {
  private baseUrl: string;
  private notificacionesSubject = new BehaviorSubject<NotificacionUsuarioDto[]>(
    []
  );
  private contadorSubject = new BehaviorSubject<number>(0);

  public notificaciones$ = this.notificacionesSubject.asObservable();
  public contador$ = this.contadorSubject.asObservable();
  constructor(
    private http: HttpClient,
    private urlService: UrlService,
    private securityService: SecurityService
  ) {
    this.baseUrl = this.urlService.baseUrl;

    interval(30000).subscribe(() => {
      if (this.securityService.isLoggedIn()) {
        this.actualizarNotificaciones();
      }
    });
  }

  inicializar(): void {
    if (this.securityService.isLoggedIn()) {
      this.actualizarNotificaciones();
    }
  }

  obtenerMisNotificaciones(): Observable<ResponseListadoNotificacionUsuario> {
    return this.http.get<ResponseListadoNotificacionUsuario>(
      `${this.baseUrl}/NotificacionesUsuarios/mis-notificaciones`
    );
  }

  contarNoLeidas(): Observable<number> {
    return this.http.get<number>(
      `${this.baseUrl}/NotificacionesUsuarios/contar-no-leidas`
    );
  }

  marcarComoLeida(id: number): Observable<string> {
    return this.http.put(
      `${this.baseUrl}/NotificacionesUsuarios/${id}/marcar-leida`,
      {},
      { responseType: 'text' }
    );
  }

  marcarTodasComoLeidas(): Observable<string> {
    return this.http.post(
      `${this.baseUrl}/NotificacionesUsuarios/marcar-todas-leidas`,
      {},
      { responseType: 'text' }
    );
  }

  eliminarNotificacion(id: number): Observable<string> {
    return this.http.put(
      `${this.baseUrl}/NotificacionesUsuarios/${id}/eliminar`,
      {},
      { responseType: 'text' }
    );
  }
  
  private actualizarNotificaciones(): void {
    if (!this.securityService.isLoggedIn()) {
      return;
    }

    this.obtenerMisNotificaciones().subscribe({
      next: (response) => {
        this.notificacionesSubject.next(response.notificacionUsuarios || []);
      },
      error: (error) => {
      },
    });

    this.contarNoLeidas().subscribe({
      next: (count) => {
        this.contadorSubject.next(count);
      },
      error: (error) => {
      },
    });
  }

  refrescar(): void {
    if (this.securityService.isLoggedIn()) {
      this.actualizarNotificaciones();
    }
  }

  refrescarPostVenta(): void {
    if (this.securityService.isLoggedIn()) {
      setTimeout(() => {
        this.actualizarNotificaciones();
      }, 500);
    }
  }

  marcarLeidaYActualizar(id: number): void {
    if (!this.securityService.isLoggedIn()) {
      return;
    }

    this.marcarComoLeida(id).subscribe({
      next: () => {
        this.actualizarNotificaciones();
      },
      error: (error) => {
      },
    });
  }

  marcarTodasLeidasYActualizar(): void {
    if (!this.securityService.isLoggedIn()) {
      return;
    }

    this.marcarTodasComoLeidas().subscribe({
      next: () => {
        this.actualizarNotificaciones();
      },
      error: (error) => {
      },
    });
  }

  eliminarNotificacionYActualizar(id: number): void {
    if (!this.securityService.isLoggedIn()) {
      return;
    }

    this.eliminarNotificacion(id).subscribe({
      next: () => {
        this.actualizarNotificaciones();
      },
      error: (error) => {
      },
    });
  }
}

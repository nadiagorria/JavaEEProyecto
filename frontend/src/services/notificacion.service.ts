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
  providedIn: 'root'
})
export class NotificacionService {
  private baseUrl: string;
  private notificacionesSubject = new BehaviorSubject<NotificacionUsuarioDto[]>([]);
  private contadorSubject = new BehaviorSubject<number>(0);

  public notificaciones$ = this.notificacionesSubject.asObservable();
  public contador$ = this.contadorSubject.asObservable();  constructor(
    private http: HttpClient,
    private urlService: UrlService,
    private securityService: SecurityService
  ) {
    this.baseUrl = this.urlService.baseUrl;
    
    // Actualizar notificaciones cada 30 segundos solo si está autenticado
    interval(30000).subscribe(() => {
      if (this.securityService.isLoggedIn()) {
        this.actualizarNotificaciones();
      }
    });
  }
  /**
   * Inicializa el servicio cargando las notificaciones solo si está autenticado
   */
  inicializar(): void {
    if (this.securityService.isLoggedIn()) {
      this.actualizarNotificaciones();
    }
  }
  /**
   * Obtiene las notificaciones del usuario actual
   */
  obtenerMisNotificaciones(): Observable<ResponseListadoNotificacionUsuario> {
    return this.http.get<ResponseListadoNotificacionUsuario>(
      `${this.baseUrl}/NotificacionesUsuarios/mis-notificaciones`
    );
  }

  /**
   * Cuenta las notificaciones no leídas
   */
  contarNoLeidas(): Observable<number> {
    return this.http.get<number>(
      `${this.baseUrl}/NotificacionesUsuarios/contar-no-leidas`
    );
  }
  /**
   * Marca una notificación como leída
   */
  marcarComoLeida(id: number): Observable<string> {
    return this.http.put(
      `${this.baseUrl}/NotificacionesUsuarios/${id}/marcar-leida`,
      {},
      { responseType: 'text' }
    );
  }
  /**
   * Marca todas las notificaciones como leídas
   */
  marcarTodasComoLeidas(): Observable<string> {
    return this.http.post(
      `${this.baseUrl}/NotificacionesUsuarios/marcar-todas-leidas`,
      {},
      { responseType: 'text' }
    );
  }  /**
   * Actualiza el estado de las notificaciones solo si está autenticado
   */
  private actualizarNotificaciones(): void {
    if (!this.securityService.isLoggedIn()) {
      return;
    }

    this.obtenerMisNotificaciones().subscribe({
      next: (response) => {
        this.notificacionesSubject.next(response.notificacionUsuarios || []);
      },
      error: (error) => {
        console.error('❌ Error al obtener notificaciones:', error);
      }
    });

    this.contarNoLeidas().subscribe({
      next: (count) => {
        this.contadorSubject.next(count);
      },
      error: (error) => {
        console.error('❌ Error al contar notificaciones:', error);
      }
    });
  }  /**
   * Fuerza una actualización de las notificaciones solo si está autenticado
   */
  refrescar(): void {
    if (this.securityService.isLoggedIn()) {
      this.actualizarNotificaciones();
    }
  }
  /**
   * Marca una notificación como leída y actualiza el estado
   */
  marcarLeidaYActualizar(id: number): void {
    if (!this.securityService.isLoggedIn()) {
      return;
    }
    
    this.marcarComoLeida(id).subscribe({
      next: () => {
        this.actualizarNotificaciones();
      },
      error: (error) => {
        console.error('Error al marcar notificación como leída:', error);
      }
    });
  }

  /**
   * Marca todas como leídas y actualiza el estado
   */
  marcarTodasLeidasYActualizar(): void {
    if (!this.securityService.isLoggedIn()) {
      return;
    }
    
    this.marcarTodasComoLeidas().subscribe({
      next: () => {
        this.actualizarNotificaciones();
      },
      error: (error) => {
        console.error('Error al marcar todas como leídas:', error);
      }
    });
  }
}

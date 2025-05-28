import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, interval } from 'rxjs';
import { UrlService } from './url.service';
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
    private urlService: UrlService
  ) {
    this.baseUrl = this.urlService.baseUrl;
    
    // Actualizar notificaciones cada 30 segundos
    interval(30000).subscribe(() => {
      this.actualizarNotificaciones();
    });
  }

  /**
   * Inicializa el servicio cargando las notificaciones
   */
  inicializar(): void {
    this.actualizarNotificaciones();
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
   * Actualiza el estado de las notificaciones
   */
  private actualizarNotificaciones(): void {
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
  }

  /**
   * Fuerza una actualización de las notificaciones
   */
  refrescar(): void {
    this.actualizarNotificaciones();
  }

  /**
   * Marca una notificación como leída y actualiza el estado
   */
  marcarLeidaYActualizar(id: number): void {
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

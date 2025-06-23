import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { NotificacionService } from '../../../services/notificacion.service';
import { SecurityService } from '../../../services/security.service';
import { NotificacionUsuarioDto } from '../../../models/notificacion-usuario.dto';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    BadgeModule,
    DialogModule,
    ToastModule,
    TooltipModule,
  ],
  providers: [MessageService],
  templateUrl: './notificaciones.component.html',
  styleUrl: './notificaciones.component.scss',
})
export class NotificacionesComponent implements OnInit, OnDestroy {
  notificaciones: NotificacionUsuarioDto[] = [];
  contadorNoLeidas: number = 0;
  mostrarDropdown: boolean = false;

  mostrarDialog: boolean = false;
  notificacionSeleccionada: NotificacionUsuarioDto | null = null;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private notificacionService: NotificacionService,
    private securityService: SecurityService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    if (!this.securityService.isLoggedIn()) {
      return;
    }

    this.subscriptions.add(
      this.notificacionService.notificaciones$.subscribe(
        (notificaciones: NotificacionUsuarioDto[]) => {
          this.notificaciones = notificaciones;
        }
      )
    );

    this.subscriptions.add(
      this.notificacionService.contador$.subscribe((contador: number) => {
        this.contadorNoLeidas = contador;
      })
    );

    this.notificacionService.inicializar();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  get estaAutenticado(): boolean {
    return this.securityService.isLoggedIn();
  }

  toggleDropdown(): void {
    this.mostrarDropdown = !this.mostrarDropdown;
  }

  cerrarDropdown(): void {
    this.mostrarDropdown = false;
  }

  marcarComoLeida(notificacion: NotificacionUsuarioDto): void {
    this.notificacionSeleccionada = notificacion;

    this.mostrarDialog = true;

    this.cerrarDropdown();

    if (!notificacion.leido && notificacion.id) {
      this.notificacionService.marcarLeidaYActualizar(notificacion.id);
    }
  }

  marcarTodasComoLeidas(): void {
    this.notificacionService.marcarTodasLeidasYActualizar();
    this.cerrarDropdown();
  }

  cerrarDialog(): void {
    this.mostrarDialog = false;
    this.notificacionSeleccionada = null;
  }

  eliminarNotificacion(
    notificacion: NotificacionUsuarioDto,
    event?: Event
  ): void {
    if (event) {
      event.stopPropagation();
    }

    if (notificacion.id) {
      this.notificacionService.eliminarNotificacionYActualizar(notificacion.id);

      this.messageService.clear();
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Notificación eliminada correctamente',
      });

      if (this.notificacionSeleccionada?.id === notificacion.id) {
        this.cerrarDialog();
      }
    }
  }

  formatearFecha(fechaHora: any): string {
    if (!fechaHora) return '';

    const fecha = new Date(fechaHora);
    const ahora = new Date();
    const diferencia = ahora.getTime() - fecha.getTime();

    const minutos = Math.floor(diferencia / (1000 * 60));
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));

    if (minutos < 1) {
      return 'Ahora';
    } else if (minutos < 60) {
      return `Hace ${minutos} min`;
    } else if (horas < 24) {
      return `Hace ${horas} h`;
    } else if (dias < 7) {
      return `Hace ${dias} días`;
    } else {
      return fecha.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
      });
    }
  }

  formatearFechaCompleta(fechaHora: any): string {
    if (!fechaHora) return 'Sin fecha';

    const fecha = new Date(fechaHora);
    return fecha.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  obtenerTitulo(notificacionUsuario: NotificacionUsuarioDto): string {
    if (
      notificacionUsuario.notificaciones &&
      notificacionUsuario.notificaciones.length > 0
    ) {
      return notificacionUsuario.notificaciones[0].titulo || 'Sin título';
    }
    return 'Sin título';
  }

  obtenerMensaje(notificacionUsuario: NotificacionUsuarioDto): string {
    if (
      notificacionUsuario.notificaciones &&
      notificacionUsuario.notificaciones.length > 0
    ) {
      return notificacionUsuario.notificaciones[0].mensaje || 'Sin mensaje';
    }
    return 'Sin mensaje';
  }

  obtenerFecha(notificacionUsuario: NotificacionUsuarioDto): any {
    if (
      notificacionUsuario.notificaciones &&
      notificacionUsuario.notificaciones.length > 0
    ) {
      return notificacionUsuario.notificaciones[0].fechaHora;
    }
    return null;
  }
}

import { UsuarioDto } from './usuario.dto';
import { NotificacionDto } from './notificacion.dto';

export interface NotificacionUsuarioDto {
  id: number;
  leido: boolean;
  notificaciones: NotificacionDto[];
  usuarios: UsuarioDto[];
  activo: boolean;
}


import { UsuarioDto } from './usuario';
import { NotificacionDto } from './notificacion';

export interface NotificacionUsuarioDto {
    id: number;
    leido: boolean;
    notificaciones: Pick<NotificacionDto, 'id' | 'mensajes' | 'fechaHora'>[];
    usuarios: Pick<UsuarioDto, 'mail' | 'nombre'>[];
    activo: boolean;
}

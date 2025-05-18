
import { UsuarioDto } from './usuario.dto';
import { NotificacionDto } from './notificacion.dto';

export interface NotificacionUsuarioDto {
    id: number;
    leido: boolean;
    notificaciones: Pick<NotificacionDto, 'id' | 'mensajes' | 'fechaHora'>[];
    usuarios: Pick<UsuarioDto, 'mail' | 'nombre'>[];
    activo: boolean;
}

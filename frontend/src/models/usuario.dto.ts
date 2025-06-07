
import { RolUsuarioDto } from './rol-usuario.dto';
import { NotificacionUsuarioDto } from './notificacion-usuario.dto';
import { VentaDto } from './venta.dto';

export interface UsuarioDto {
    mail: string;
    nombre: string;
    contrasenia: string;
    activo: boolean;
    roles: Pick<RolUsuarioDto, 'id' | 'nombre'>[];
    notificaciones: Pick<NotificacionUsuarioDto, 'id' | 'leido'>[];
    ventas: Pick<VentaDto, 'id' | 'fechaVenta' | 'total' | 'formaPago'>[];
}

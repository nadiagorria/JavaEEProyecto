
import { RolUsuarioDto } from './rol-usuario';
import { NotificacionUsuarioDto } from './notificacion-usuario';
import { VentaDto } from './venta';

export interface UsuarioDto {
    mail: string;
    nombre: string;
    contrasenia: string;
    activo: boolean;
    roles: Pick<RolUsuarioDto, 'id' | 'nombre'>[];
    notificaciones: Pick<NotificacionUsuarioDto, 'id' | 'leido'>[];
    ventas: Pick<VentaDto, 'id' | 'fechaVenta'>[];
}

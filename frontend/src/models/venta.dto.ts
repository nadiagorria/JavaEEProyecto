
import { CreditoDto } from './credito.dto';
import { CantidadDto } from './cantidad.dto';
import { UsuarioDto } from './usuario.dto';

export interface VentaDto {
    id: number;
    fechaVenta: Date;
    total: number;
    credito: Pick<CreditoDto, 'id' | 'precioTotal'>;
    cantidades: Pick<CantidadDto, 'id' | 'cantidad' | 'precioActual' | 'producto'>[];
    activo: boolean;
    finalizada: boolean;
    formaPago: string;
    usuario: Pick<UsuarioDto, 'mail' | 'nombre'>;
}

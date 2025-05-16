
import { CreditoDto } from './credito';
import { CantidadDto } from './cantidad';
import { UsuarioDto } from './usuario';

export interface VentaDto {
    id: number;
    fechaVenta: Date;
    total: number;
    credito: Pick<CreditoDto, 'id' | 'precioTotal'>;
    cantidades: Pick<CantidadDto, 'id' | 'cantidad'>[];
    activo: boolean;
    finalizada: boolean;
    formaPago: string;
    usuario: Pick<UsuarioDto, 'mail' | 'nombre'>;
}

import { ClienteDto } from './cliente.dto';
import { VentaDto } from './venta.dto';

export interface CreditoDto {
    id: number;
    precioTotal: number;
    minimo: number;
    maximo: number;
    pagoHastaAhora: number;
    cliente: Pick<ClienteDto, 'id' | 'nombre' | 'telefono'>;
    ventas?: Pick<VentaDto, 'id' | 'fechaVenta' | 'total'>[];
}

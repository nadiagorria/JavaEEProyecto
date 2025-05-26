import { ClienteDto } from './cliente.dto';
import { VentaDto } from './venta.dto';

export interface CreditoDto {
    id: number;
    precioTotal: number;
    minimo: number;
    maximo: number;
    pagoHastaAhora: number;
    cliente: Pick<ClienteDto, 'id' | 'nombre'>;
    ventas?: Pick<VentaDto, 'id' | 'fechaVenta' | 'total'>[]; 
}

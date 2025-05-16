
import { VentaDto } from './venta';
import { ProductoDto } from './producto';

export interface CantidadDto {
    id: number;
    cantidad: number;
    producto: Pick<ProductoDto, 'id' | 'nombre'>;
    venta: Pick<VentaDto, 'id' | 'fechaVenta'>;
}

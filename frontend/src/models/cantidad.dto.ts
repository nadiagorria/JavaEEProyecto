
import { VentaDto } from './venta.dto';
import { ProductoDto } from './producto.dto';

export interface CantidadDto {
    id: number;
    cantidad: number;
    producto: Pick<ProductoDto, 'id' | 'nombre' | 'precioVenta'>;
    venta: Pick<VentaDto, 'id' | 'fechaVenta'>;
}

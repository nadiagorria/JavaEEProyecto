
import { VentaDto } from './venta.dto';
import { ProductoDto } from './producto.dto';

export interface CantidadDto {
    id: number | null;
    cantidad: number;
    precioActual: number;
    producto: Pick<ProductoDto, 'id' | 'nombre' | 'precioVenta' | 'codigoDeBarra'>;
    venta: Pick<VentaDto, 'id' | 'fechaVenta'>;
}

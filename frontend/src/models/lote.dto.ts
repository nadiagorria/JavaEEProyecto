
import { ProductoDto } from './producto.dto';

export interface LoteDto {
    id: number | null;
    numeLote: string;
    stock: number;
    fechaVencimiento: string; // ISO date format: YYYY-MM-DD
    precioCompra: number;
    activo: boolean;
    producto: Pick<ProductoDto, 'id' | 'nombre'>;
}

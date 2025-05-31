
import { ProductoDto } from './producto.dto';

export interface LoteDto {
    id: number | null;
    numeLote: string;
    stock: number;
    fechaVencimiento: Date;
    precioCompra: number;
    activo: boolean;
    producto: Pick<ProductoDto, 'id' | 'nombre'>;
}

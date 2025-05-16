
import { ProductoDto } from './producto';

export interface LoteDto {
    id: number;
    numeLote: string;
    stock: number;
    fechaVencimiento: Date;
    precioCompra: number;
    activo: boolean;
    producto: Pick<ProductoDto, 'id' | 'nombre'>;
}

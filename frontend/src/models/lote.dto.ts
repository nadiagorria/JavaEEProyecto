
import { ProductoDto } from './producto.dto';

export interface LoteDto {
    id: number | null;
    numeLote: string;
    stock: number;
    fechaVencimiento: Date; // Puede ser Date o string en el front, pero siempre se envía como string al backend
    precioCompra: number;
    activo: boolean;
    producto: Pick<ProductoDto, 'id' | 'nombre'>;
}

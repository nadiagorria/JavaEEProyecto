
import { ProductoDto } from './producto';

export interface DescuentoDto extends OfertaDto {
    producto: Pick<ProductoDto, 'id' | 'nombre'>;
}

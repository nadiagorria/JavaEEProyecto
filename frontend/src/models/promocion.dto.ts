
import { ProductoDto } from './producto.dto';
import { OfertaDto } from './oferta.dto';

export interface PromocionDto extends OfertaDto {
    producto: Pick<ProductoDto, 'id' | 'nombre'>;
}

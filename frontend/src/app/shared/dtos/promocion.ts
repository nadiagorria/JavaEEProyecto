
import { ProductoDto } from './producto';

export interface PromocionDto extends OfertaDto {
    descripcion: string;
    producto: Pick<ProductoDto, 'id' | 'nombre'>;
}

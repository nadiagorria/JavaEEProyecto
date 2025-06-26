import { ProductoDto } from './producto.dto';
import { OfertaDto } from './oferta.dto';

export interface ComboDto extends OfertaDto {
  productos: Pick<ProductoDto, 'id' | 'nombre'>[];
}

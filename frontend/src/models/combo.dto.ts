
import { ProductoDto } from './producto.dto';
import { OfertaDto } from './oferta.dto';

export interface ComboDto extends OfertaDto {
    descripcion: string;
    productos: Pick<ProductoDto, 'id' | 'nombre'>[];
}

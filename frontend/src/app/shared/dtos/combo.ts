
import { ProductoDto } from './producto';

export interface ComboDto extends OfertaDto {
    descripcion: string;
    productos: Pick<ProductoDto, 'id' | 'nombre'>[];
}

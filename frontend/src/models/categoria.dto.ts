
import { ProductoDto } from './producto.dto';

export interface CategoriaDto {
    id: number | null;
    nombre: string;
    activo: boolean;
    subcategorias: Pick<CategoriaDto, 'id' | 'nombre'>[];
    categoriaPadre: Pick<CategoriaDto, 'id' | 'nombre'> | null;
    productos: Pick<ProductoDto, 'id' | 'nombre'>[];
}


import { ProductoDto } from './producto.dto';
import { EntidadDto } from './entidad.dto';

export interface ProveedorDto extends EntidadDto {
    id: number;
    nombre: string;
    telefono: string;
    correo: string;
    productosDto: Pick<ProductoDto, 'id' | 'nombre'>[];
}

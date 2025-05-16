
import { ProductoDto } from './producto';

export interface ProveedorDto extends EntidadDto {
    id: number;
    nombre: string;
    telefono: string;
    correo: string;
    productosDto: Pick<ProductoDto, 'id' | 'nombre'>[];
}

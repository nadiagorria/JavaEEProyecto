
import { CategoriaDto } from './categoria';
import { LoteDto } from './lote';
import { ProveedorDto } from './proveedor';
import { CantidadDto } from './cantidad';
import { PromocionDto } from './promocion';
import { ComboDto } from './combo';
import { DescuentoDto } from './descuento';

export interface ProductoDto {
    id: number;
    precioCompra: number;
    precioVenta: number;
    codigoDeBarra: string;
    stockMin: number;
    stockTotal: number;
    nombre: string;
    imagen: string;
    promociones : Pick<PromocionDto, 'id'>[];
    combos : Pick<ComboDto, 'id'>[];
    descuentos : Pick<DescuentoDto, 'id'>[];
    categoria: Pick<CategoriaDto, 'id' | 'nombre'>;
    proveedor: Pick<ProveedorDto, 'id' | 'nombre'>;
    lotes: Pick<LoteDto, 'id' | 'numeLote'>[];
    cantidades: Pick<CantidadDto, 'id' | 'cantidad'>[];
    activo: boolean;
}

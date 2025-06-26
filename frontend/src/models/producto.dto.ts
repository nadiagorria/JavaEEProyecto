import { CategoriaDto } from './categoria.dto';
import { LoteDto } from './lote.dto';
import { ProveedorDto } from './proveedor.dto';
import { CantidadDto } from './cantidad.dto';
import { PromocionDto } from './promocion.dto';
import { ComboDto } from './combo.dto';
import { DescuentoDto } from './descuento.dto';

export interface ProductoDto {
  id: number | null;
  precioCompra: number;
  precioVenta: number;
  codigoDeBarra: string;
  stockMin: number;
  stockTotal: number;
  nombre: string;
  imagen: string | ArrayBuffer | null;
  promociones: Pick<PromocionDto, 'id'>[];
  combos: Pick<ComboDto, 'id'>[];
  descuentos: Pick<DescuentoDto, 'id'>[];
  categoria: Pick<CategoriaDto, 'id' | 'nombre'> | null;
  proveedor: Pick<ProveedorDto, 'id' | 'nombre'> | null;
  lotes: Pick<
    LoteDto,
    'id' | 'numeLote' | 'fechaVencimiento' | 'precioCompra' | 'stock' | 'activo'
  >[];
  cantidades: Pick<CantidadDto, 'id' | 'cantidad'>[];
  activo: boolean;
}

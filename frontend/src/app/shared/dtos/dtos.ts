
export interface CantidadDto {
    id: number;
    cantidad: number;
    producto: Pick<ProductoDto, 'id' | 'nombre'>;
    venta: Pick<VentaDto, 'id' | 'fecha'>;
}

export interface CategoriaDto {
    nombre: string;
    activo: boolean;
    subcategorias: Pick<CategoriaDto, 'nombre' | 'activo'>[];
    categoriaPadre: Pick<CategoriaDto, 'nombre' | 'activo'> | null;
    productos: Pick<ProductoDto, 'id' | 'nombre'>[];
}

export interface ClienteDto extends EntidadDto {
    id: number;
    nombre: string;
    telefono: string;
}

export interface ComboDto extends OfertaDto {
    descripcion: string;
    productos: Pick<ProductoDto, 'id' | 'nombre'>[];
}

export interface CreditoDto {
    id: number;
    precioTotal: number;
    minimo: number;
    maximo: number;
    pagoHastaAhora: number;
    cliente: Pick<ClienteDto, 'id' | 'nombre'>;
}

export interface DescuentoDto extends OfertaDto {
    producto: Pick<ProductoDto, 'id' | 'nombre'>;
}

export interface EntidadDto {
    nombre: string;
    telefono: string;
    activo: boolean;
    id: number;
}

export interface LoteDto {
    id: number;
    numeLote: string;
    stock: number;
    fechaVencimiento: Date;
    precioCompra: number;
    activo: boolean;
}

export interface NotificacionDto {
    id: number;
    mensajes: string[];
    fechaHora: string; // ISO string format
}

export interface ProductoDto {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    categoria: Pick<CategoriaDto, 'nombre'>;
}

export interface VentaDto {
    id: number;
    fecha: string; // ISO string format
    cliente: Pick<ClienteDto, 'id' | 'nombre'>;
    cantidades: Pick<CantidadDto, 'id' | 'cantidad'>[];
}

export interface OfertaDto {
    id: number;
    nombre: string;
    descuento: number;
}


import { CreditoDto, CreditoSimpleDto } from './credito.dto';
import { CantidadDto } from './cantidad.dto';

export interface VentaDto {
    id: number | null;
    fechaVenta: string; // ISO datetime format from LocalDateTime
    total: number;
    credito: Pick<CreditoDto, 'id' | 'precioTotal'>;
    cantidades: Pick<CantidadDto, 'id' | 'cantidad' | 'precioActual' | 'producto'>[];
    activo: boolean;
    formaPago: string;
    usuario: string;
}

export interface VentaSimpleDto {
    id: number | null;
    fechaVenta: string;
    total: number;
    cantidades: Pick<CantidadDto, 'id' | 'cantidad' | 'precioActual' | 'producto'>[];
    activo: boolean;
    formaPago: string;
    usuario: string;
    credito: Pick<CreditoSimpleDto, 'id' | 'cliente'>;

}
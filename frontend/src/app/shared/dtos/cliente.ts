
import { CreditoDto } from './credito';

export interface ClienteDto extends EntidadDto {
    id: number;
    nombre: string;
    telefono: string;
    credito: Pick<CreditoDto, 'id' | 'precioTotal'>;
}


import { ClienteDto } from './cliente';

export interface CreditoDto {
    id: number;
    precioTotal: number;
    minimo: number;
    maximo: number;
    pagoHastaAhora: number;
    cliente: Pick<ClienteDto, 'id' | 'nombre'>;
}


import { ClienteDto } from './cliente.dto';

export interface CreditoDto {
    id: number;
    precioTotal: number;
    minimo: number;
    maximo: number;
    pagoHastaAhora: number;
    cliente: Pick<ClienteDto, 'id' | 'nombre'>;
}

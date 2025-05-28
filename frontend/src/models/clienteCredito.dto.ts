import { CreditoDto } from './credito.dto';
import { ClienteDto } from './cliente.dto';

export interface clienteCreditoDto {
    cliente: Pick<ClienteDto, 'nombre' | 'telefono'>;
    credito: Pick<CreditoDto, 'precioTotal' | 'pagoHastaAhora' | 'minimo' | 'maximo'>;
}
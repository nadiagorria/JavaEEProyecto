
import { UsuarioDto } from './usuario';

export interface RolUsuarioDto {
    id: number;
    nombre: string;
    usuarios: Pick<UsuarioDto, 'mail' | 'nombre'>[];
}

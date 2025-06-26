import { UsuarioDto } from './usuario.dto';

export interface RolUsuarioDto {
  id: number;
  nombre: string;
  usuarios: Pick<UsuarioDto, 'mail' | 'nombre'>[];
}

package ti.proyectojava.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class UsuarioSecurityDto {

    private String nombreUsuario;

    private String token;

    private String[] roles;
}

package ti.proyectojava.api.responses;

import lombok.Data;
import ti.proyectojava.dtos.UsuarioDto;

import java.util.List;

@Data
public class ResponseListadoUsuarios {
    private List<UsuarioDto> usuarios;
}

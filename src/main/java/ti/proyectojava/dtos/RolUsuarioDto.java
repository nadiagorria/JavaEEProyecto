package ti.proyectojava.dtos;

import lombok.Data;

import java.util.List;

@Data
public class RolUsuarioDto {

    private Long id;

    private String nombre;

    private List<UsuarioDto> usuarios;
}

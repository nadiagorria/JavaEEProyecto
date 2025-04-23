package ti.proyectojava.dtos;

import lombok.Data;

@Data
public class ClienteDto extends EntidadDto{
    private Long id;
    private String nombre;
    private String telefono;
}

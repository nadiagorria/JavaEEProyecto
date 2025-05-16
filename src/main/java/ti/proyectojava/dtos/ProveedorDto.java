package ti.proyectojava.dtos;

import lombok.Data;

import java.util.List;

@Data
public class ProveedorDto extends EntidadDto{
    private Long id;
    private String nombre;
    private String telefono;
    private String correo;
    private List<ProductoDto> productosDto;
}

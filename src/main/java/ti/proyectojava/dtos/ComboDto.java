package ti.proyectojava.dtos;

import lombok.Data;

import java.util.List;

@Data
public class ComboDto extends OfertaDto{

    private String descripcion;

    private List<ProductoDto> productos;
}

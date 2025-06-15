package ti.proyectojava.dtos;

import lombok.Data;

import java.util.List;

@Data
public class ComboDto extends OfertaDto{

    private List<ProductoDto> productos;
}

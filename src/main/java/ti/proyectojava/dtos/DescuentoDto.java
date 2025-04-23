package ti.proyectojava.dtos;

import lombok.Data;

@Data
public class DescuentoDto extends OfertaDto{

    private ProductoDto producto;
}

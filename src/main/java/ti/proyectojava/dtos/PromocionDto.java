package ti.proyectojava.dtos;

import lombok.Data;

@Data
public class PromocionDto extends OfertaDto{

    String descripcion;

    ProductoDto producto;
}

package ti.proyectojava.api.responses;

import lombok.Data;
import ti.proyectojava.dtos.ProductoDto;

import java.util.List;

@Data
public class ResponseListadoProductos {
    private List<ProductoDto> producto;

}

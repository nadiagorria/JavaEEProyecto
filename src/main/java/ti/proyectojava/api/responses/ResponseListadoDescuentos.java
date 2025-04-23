package ti.proyectojava.api.responses;

import lombok.Data;
import ti.proyectojava.dtos.DescuentoDto;

import java.util.List;

@Data
public class ResponseListadoDescuentos {
    private List<DescuentoDto> descuentos;

}

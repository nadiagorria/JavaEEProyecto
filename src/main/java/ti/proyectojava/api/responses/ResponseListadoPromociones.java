package ti.proyectojava.api.responses;

import lombok.Data;
import ti.proyectojava.dtos.PromocionDto;

import java.util.List;

@Data
public class ResponseListadoPromociones {
    private List<PromocionDto> promociones;

}

package ti.proyectojava.api.responses;

import lombok.Data;
import ti.proyectojava.dtos.CreditoDto;

import java.util.List;

@Data
public class ResponseListadoCreditos {
    private List<CreditoDto> creditos;
}

package ti.proyectojava.api.responses;

import lombok.Data;
import ti.proyectojava.dtos.CantidadDto;

import java.util.List;

@Data
public class ResponseListadoCantidades {
    private List<CantidadDto> cantidades;
}

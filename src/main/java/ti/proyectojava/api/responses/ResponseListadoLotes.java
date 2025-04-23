package ti.proyectojava.api.responses;

import lombok.Data;
import ti.proyectojava.dtos.LoteDto;

import java.util.List;

@Data
public class ResponseListadoLotes {
    private List<LoteDto> lotes;

}

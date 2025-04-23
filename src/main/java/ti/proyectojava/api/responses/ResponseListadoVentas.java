package ti.proyectojava.api.responses;

import lombok.Data;
import ti.proyectojava.dtos.VentaDto;

import java.util.List;

@Data
public class ResponseListadoVentas {
    private List<VentaDto> ventas;

}

package ti.proyectojava.api.responses;

import lombok.Data;
import ti.proyectojava.dtos.ProveedorDto;

import java.util.List;

@Data
public class ResponseListadoProveedores {
    private List<ProveedorDto> proveedores;

}

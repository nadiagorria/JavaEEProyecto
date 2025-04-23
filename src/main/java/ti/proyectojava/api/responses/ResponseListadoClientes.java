package ti.proyectojava.api.responses;

import lombok.Data;
import ti.proyectojava.dtos.ClienteDto;

import java.util.List;

@Data
public class ResponseListadoClientes
{
    private List<ClienteDto> clientes;

}

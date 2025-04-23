package ti.proyectojava.api.responses;

import lombok.Data;
import ti.proyectojava.dtos.CategoriaDto;

import java.util.List;

@Data
public class ResponseListadoCategorias {
    private List<CategoriaDto> categorias;
}

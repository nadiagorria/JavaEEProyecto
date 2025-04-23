package ti.proyectojava.api.responses;

import lombok.Data;
import ti.proyectojava.dtos.ComboDto;

import java.util.List;

@Data
public class ResponseListadoCombos {
    private List<ComboDto> combos;

}

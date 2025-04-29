package ti.proyectojava.dtos;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class NotificacionDto {

    private Long id;
    private List<String> mensajes;
    private LocalDateTime fechaHora;

}

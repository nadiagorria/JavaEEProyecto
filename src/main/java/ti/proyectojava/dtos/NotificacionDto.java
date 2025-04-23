package ti.proyectojava.dtos;

import lombok.Data;

import java.util.List;

@Data
public class NotificacionDto {

    private Long id;
    private List<String> mensajes;

}

package ti.proyectojava.api.responses;

import lombok.Data;
import ti.proyectojava.dtos.NotificacionDto;

import java.util.List;

@Data
public class ResponseListadoNotificaciones {
    private List<NotificacionDto> notificaciones;

}

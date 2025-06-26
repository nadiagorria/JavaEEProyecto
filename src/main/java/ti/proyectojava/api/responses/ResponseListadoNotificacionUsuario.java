package ti.proyectojava.api.responses;

import lombok.Data;
import ti.proyectojava.dtos.NotificacionUsuarioDto;

import java.util.List;

@Data
public class ResponseListadoNotificacionUsuario {
    private List<NotificacionUsuarioDto> notificacionUsuarios;
}

package ti.proyectojava.dtos;

import lombok.Data;

import java.util.List;

@Data
public class NotificacionUsuarioDto {

    private Long id;

    private Boolean leido;

    private List<NotificacionDto> notificaciones;

    private List<UsuarioDto> usuarios;

    private Boolean activo;

}

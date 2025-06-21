package ti.proyectojava.dtos;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NotificacionDto {

    private Long id;

    private String titulo;

    private String mensaje;

    private LocalDateTime fechaHora;
}

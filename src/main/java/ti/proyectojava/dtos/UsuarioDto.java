package ti.proyectojava.dtos;

import lombok.Data;

import java.util.List;

@Data
public class UsuarioDto{
    private String mail;
    private String nombre;
    private String contrasenia;
    private String nuevaContrasenia;
    private Boolean activo;
    private List<RolUsuarioDto> roles;
    private List<NotificacionUsuarioDto> notificaciones;
    private List<VentaDto> ventas;
}

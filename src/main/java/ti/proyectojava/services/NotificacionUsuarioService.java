package ti.proyectojava.services;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import ti.proyectojava.api.responses.ResponseListadoNotificacionUsuario;
import ti.proyectojava.api.responses.ResponseListadoUsuarios;
import ti.proyectojava.business.entities.Notificacion;
import ti.proyectojava.business.entities.NotificacionUsuario;
import ti.proyectojava.business.entities.Usuario;
import ti.proyectojava.business.repositories.NotificacionUsuarioRepository;
import ti.proyectojava.dtos.NotificacionDto;
import ti.proyectojava.dtos.NotificacionUsuarioDto;
import ti.proyectojava.dtos.UsuarioDto;

import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class NotificacionUsuarioService {

    private final NotificacionUsuarioRepository notificacionUsuarioRepository;

    public NotificacionUsuarioService(NotificacionUsuarioRepository notificacionUsuarioRepository) {
        this.notificacionUsuarioRepository = notificacionUsuarioRepository;
    }

    public ResponseListadoNotificacionUsuario listadoNotificacionUsuario(){
        ResponseListadoNotificacionUsuario responseListadoNotificacionUsuario = new ResponseListadoNotificacionUsuario();

        List<NotificacionUsuarioDto> notificacionUsuarioActivos = notificacionUsuarioRepository.findByActivoTrue()
                .stream()
                .map(this::mapToDtoNotificacionUsuario)
                .toList();

        responseListadoNotificacionUsuario.setNotificacionUsuarios(notificacionUsuarioActivos);

        return responseListadoNotificacionUsuario;
    }

    public String crearNotificacionUsuario(NotificacionUsuarioDto notificacionUsuarioDto){
        String response = null;

        if(notificacionUsuarioRepository.findById(notificacionUsuarioDto.getId()).isEmpty()){
            response = "Producto creado nro: " + notificacionUsuarioRepository.save(mapToEntityNotificacionUsuario(notificacionUsuarioDto)).getId();
        }

        return  response;
    }

    public String borrarUsuario(String nombreUsuario){
        Optional<Usuario> usuarioAct = usuarioRepository.findById(nombreUsuario);
        String response = null;

        if (usuarioAct.isPresent()) {
            Usuario usuario = usuarioAct.get();
            usuario.setActivo(false);
            usuarioRepository.save(usuario);
            response = "Usuario eliminado correctamente.";
        }
        return response;
    }

    public String modificarUsuario(String nombre, UsuarioDto usuario){
        String response = null;

        Usuario aux = usuarioRepository.findById(nombre).orElseThrow(() -> new RuntimeException("Usuario no existe"));

        aux.setMail(usuario.getMail());
        aux.setNombre(usuario.getNombre());

        usuarioRepository.save(aux);
        response = "Usuario modificado correctamente";
        return response;
    }

    public NotificacionUsuarioDto mapToDtoNotificacionUsuario(NotificacionUsuario notificacionUsuario) {
        NotificacionUsuarioDto notificacionUsuarioDto = new NotificacionUsuarioDto();

        notificacionUsuarioDto.setId(notificacionUsuario.getId());
        notificacionUsuarioDto.setActivo(notificacionUsuarioDto.getActivo());
        notificacionUsuarioDto.setLeido(notificacionUsuarioDto.getLeido());

        if (notificacionUsuarioDto.getUsuarios() != null) {
            notificacionUsuarioDto.setUsuarios(
                    notificacionUsuario.getUsuarios().stream()
                            .map(e -> mapToDtoUsuario(e))
                            .toList()
            );
        }

        if (notificacionUsuarioDto.getNotificaciones() != null) {
            notificacionUsuarioDto.setNotificaciones(
                    notificacionUsuario.getNotificaciones().stream()
                            .map(e -> mapToDtoNotificacion(e))
                            .toList()
            );
        }

        return notificacionUsuarioDto;
    }

    private NotificacionUsuario mapToEntityNotificacionUsuario(NotificacionUsuarioDto notificacionUsuarioDto) {
        NotificacionUsuario notificacionUsuario= new NotificacionUsuario();

        notificacionUsuario.setId(notificacionUsuarioDto.getId());
        notificacionUsuario.setActivo(notificacionUsuarioDto.getActivo());
        notificacionUsuario.setLeido(notificacionUsuarioDto.getLeido());

        if (notificacionUsuarioDto.getUsuarios() != null) {
            notificacionUsuarioDto.setUsuarios(
                    notificacionUsuario.getUsuarios().stream()
                            .map(e -> mapToDtoUsuario(e))
                            .toList()
            );
        }

        if (notificacionUsuarioDto.getNotificaciones() != null) {
            notificacionUsuarioDto.setNotificaciones(
                    notificacionUsuario.getNotificaciones().stream()
                            .map(e -> mapToDtoNotificacion(e))
                            .toList()
            );
        }

        return notificacionUsuario;
    }


    public UsuarioDto mapToDtoUsuario(Usuario usuario){
        UsuarioDto usuarioDto = new UsuarioDto();
        usuarioDto.setMail(usuario.getMail());
        usuarioDto.setContrasenia(usuario.getContrasenia());
        usuarioDto.setNombre(usuario.getNombre());
        usuarioDto.setActivo(usuario.getActivo());
        usuarioDto.setRoles(usuario.getRoles().stream().map(e -> mapToDtoRoles(e)).toList());
        return usuarioDto;
    }

    public NotificacionDto mapToDtoNotificacion(Notificacion notificacion) {

        NotificacionDto notiDto = new NotificacionDto();
        notiDto.setId(notificacion.getId());
        notiDto.setMensajes(notificacion.getMensajes());

        return notiDto;
    }
}

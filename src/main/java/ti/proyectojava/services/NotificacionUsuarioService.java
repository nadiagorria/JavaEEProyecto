package ti.proyectojava.services;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import ti.proyectojava.api.responses.ResponseListadoNotificacionUsuario;
import ti.proyectojava.api.responses.ResponseListadoUsuarios;
import ti.proyectojava.business.entities.Notificacion;
import ti.proyectojava.business.entities.NotificacionUsuario;
import ti.proyectojava.business.entities.RolUsuario;
import ti.proyectojava.business.entities.Usuario;
import ti.proyectojava.business.repositories.NotificacionUsuarioRepository;
import ti.proyectojava.dtos.NotificacionDto;
import ti.proyectojava.dtos.NotificacionUsuarioDto;
import ti.proyectojava.dtos.RolUsuarioDto;
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
            response = "Producto creado. ID: " + notificacionUsuarioRepository.save(mapToEntityNotificacionUsuario(notificacionUsuarioDto)).getId();
        }

        return  response;
    }

    public String borrarNotificacionUsuario(Long id){
        Optional<NotificacionUsuario> notificacionUsuarioAct = notificacionUsuarioRepository.findById(id);
        String response = null;

        if (notificacionUsuarioAct.isPresent()) {
            NotificacionUsuario notificacionUsuario = notificacionUsuarioAct.get();
            notificacionUsuario.setActivo(false);
            notificacionUsuarioRepository.save(notificacionUsuario);
            response = "notificacionUsuario eliminado correctamente. ID:" + notificacionUsuario.getId();
        }

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

        if (notificacionUsuario.getUsuarios() != null) {
            notificacionUsuario.setUsuarios(
                    notificacionUsuarioDto.getUsuarios().stream()
                            .map(e -> mapToEntityUsuario(e))
                            .toList()
            );
        }

        if (notificacionUsuario.getNotificaciones() != null) {
            notificacionUsuario.setNotificaciones(
                    notificacionUsuarioDto.getNotificaciones().stream()
                            .map(e -> mapToEntityNotificacion(e))
                            .toList()
            );
        }

        return notificacionUsuario;
    }

    public NotificacionDto mapToDtoNotificacion(Notificacion notificacion) {

        NotificacionDto notiDto = new NotificacionDto();
        notiDto.setId(notificacion.getId());
        notiDto.setMensajes(notificacion.getMensajes());

        return notiDto;
    }

    public Notificacion mapToEntityNotificacion(NotificacionDto notificacionDto){
        Notificacion notificacion = new Notificacion();
        notificacion.setId(notificacionDto.getId());
        notificacion.setMensajes(notificacionDto.getMensajes());

        return notificacion;
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



    public Usuario mapToEntityUsuario(UsuarioDto usuarioDto){
        Usuario usuario = new Usuario();
        usuario.setMail(usuarioDto.getMail());
        usuario.setContrasenia(usuarioDto.getContrasenia());
        usuario.setNombre(usuarioDto.getNombre());
        usuario.setActivo(usuarioDto.getActivo());
        usuario.setRoles(usuarioDto.getRoles().stream().map(e -> mapToEntityRoles(e)).toList());
        return usuario;
    }

    public RolUsuario mapToEntityRoles(RolUsuarioDto rolDto){
        RolUsuario rol = new RolUsuario();
        rol.setId(rolDto.getId());
        rol.setNombre(rolDto.getNombre());
        rol.setUsuarios(rolDto.getUsuarios().stream().map(e -> mapToEntityUsuario(e)).toList());
        return rol;
    }

    public RolUsuarioDto mapToDtoRoles(RolUsuario rol){
        RolUsuarioDto rolDto = new RolUsuarioDto();
        rolDto.setId(rol.getId());
        rolDto.setNombre(rol.getNombre());
        rolDto.setUsuarios(rol.getUsuarios().stream().map(e -> mapToDtoUsuario(e)).toList());
        return rolDto;
    }


}

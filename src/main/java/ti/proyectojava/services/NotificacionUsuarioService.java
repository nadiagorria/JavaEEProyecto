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
    private final MapsDtosEntityService mapsDtosEntityService;

    public NotificacionUsuarioService(NotificacionUsuarioRepository notificacionUsuarioRepository, MapsDtosEntityService mapsDtosEntityService) {
        this.notificacionUsuarioRepository = notificacionUsuarioRepository;
        this.mapsDtosEntityService = mapsDtosEntityService;
    }

    public ResponseListadoNotificacionUsuario listadoNotificacionUsuario(){
        ResponseListadoNotificacionUsuario responseListadoNotificacionUsuario = new ResponseListadoNotificacionUsuario();

        List<NotificacionUsuarioDto> notificacionUsuarioActivos = notificacionUsuarioRepository.findByActivoTrue()
                .stream()
                .map(mapsDtosEntityService::mapToDtoNotificacionUsuario)
                .toList();

        responseListadoNotificacionUsuario.setNotificacionUsuarios(notificacionUsuarioActivos);

        return responseListadoNotificacionUsuario;
    }

    public String crearNotificacionUsuario(NotificacionUsuarioDto notificacionUsuarioDto){
        String response = null;

        if(notificacionUsuarioRepository.findById(notificacionUsuarioDto.getId()).isEmpty()){
            response = "Producto creado. ID: " + notificacionUsuarioRepository.save(mapsDtosEntityService.mapToEntityNotificacionUsuario(notificacionUsuarioDto)).getId();
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






}

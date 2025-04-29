package ti.proyectojava.services;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import ti.proyectojava.business.entities.Notificacion;
import ti.proyectojava.business.repositories.NotificacionRepository;
import ti.proyectojava.dtos.NotificacionDto;

import java.util.Optional;

@Service
@Slf4j
public class NotificacionService {

    private final NotificacionRepository notificacionRepository;
    private final MapsDtosEntityService mapsDtosEntityService;

    public NotificacionService(NotificacionRepository notificacionRepository, MapsDtosEntityService mapsDtosEntityService) {
        this.notificacionRepository = notificacionRepository;
        this.mapsDtosEntityService = mapsDtosEntityService;
    }

    public String crearNotificacion(NotificacionDto notificacionDto) {

            return "Notificacion creada. ID:" + notificacionRepository.save(mapsDtosEntityService.mapToEntityNotificacion(notificacionDto)).getId();

    }

    public Notificacion buscaNotificacion(Long id) {
        Optional<Notificacion> aux = notificacionRepository.findById(id);
        if(aux.isPresent()){
            return aux.get();
        }
        return null;
    }


}

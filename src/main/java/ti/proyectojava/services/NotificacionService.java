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

    public NotificacionService(NotificacionRepository notificacionRepository) {
        this.notificacionRepository = notificacionRepository;
    }

    public String crearNotificacion(NotificacionDto notificacionDto) {
        if(notificacionRepository.findById(notificacionDto.getId()).isEmpty()){
            return "Notificacion creada nro: " + notificacionRepository.save(mapToEntityNotificacion(notificacionDto)).getId();
        }

        return null;
    }

    public Notificacion buscaNotificacion(Long id) {
        Optional<Notificacion> aux = notificacionRepository.findById(id);
        if(aux.isPresent()){
            return aux.get();
        }
        return null;
    }

    public Notificacion mapToEntityNotificacion(NotificacionDto notificacionDto){
        Notificacion notificacion = new Notificacion();
        notificacion.setId(notificacionDto.getId());
        notificacion.setMensajes(notificacionDto.getMensajes());

        return notificacion;
    }

    public NotificacionDto mapToDtoNotificacion(Notificacion notificacion) {

        NotificacionDto notiDto = new NotificacionDto();
        notiDto.setId(notificacion.getId());
        notiDto.setMensajes(notificacion.getMensajes());

        return notiDto;
    }
}

package ti.proyectojava.api.controllers;

import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ti.proyectojava.business.entities.Notificacion;
import ti.proyectojava.dtos.NotificacionDto;
import ti.proyectojava.services.NotificacionService;

@RestController
@RequestMapping(value = "api/v1/notificacion")
public class NotificacionController {

    private final NotificacionService notificacionService;
    private Notificacion notificacionActual;

    public NotificacionController(NotificacionService notificacionService) {
        this.notificacionService = notificacionService;
    }

    //se crean solas en base a si es necesario (solo cuando hay menos del stock minimo
    // o hay algun lote proximo a vencerse)
    @PostMapping("/crear")
    @Operation(description = "Esta Funcion crea una nueva notifiacacion")
    public ResponseEntity<String> crearNotificacion(@RequestBody NotificacionDto notificacionDto){

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (!auth.getAuthorities().stream().anyMatch(p -> p.equals("ADMIN"))) {

            String response = notificacionService.crearNotificacion(notificacionDto);

            if (response == null) {
                return new ResponseEntity<>("Error al crear notificacion. ID:" + notificacionDto.getId(), HttpStatus.BAD_REQUEST);
            } else {
                return new ResponseEntity<>(response, HttpStatus.CREATED);
            }
        }
        else{
            return new ResponseEntity<>(null, HttpStatus.FORBIDDEN);
        }
    }

    //lo usa cualquiera
    @PostMapping("/seleccionar")
    @Operation(description =  "Esta funcion selecciona una nueva notificacion")
    public ResponseEntity<String> seleccionarNotificacion(@RequestBody Long id){
        Notificacion notificacion = notificacionService.buscaNotificacion(id);

        if (notificacion == null) {
            return new ResponseEntity<>("No se encontró la notificación. ID:" + id, HttpStatus.NOT_FOUND);
        }

        this.notificacionActual = notificacion;

        return new ResponseEntity<>("Notificación actual actualizada. ID:" + notificacion.getId(), HttpStatus.OK);
    }
}

package ti.proyectojava.api.controllers;

import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

    @PostMapping("/crear")
    @Operation(description = "Esta Funcion crea una nueva notifiacacion")
    public ResponseEntity<String> crearNotificacion(@RequestBody NotificacionDto notificacionDto){
        String response = notificacionService.crearNotificacion(notificacionDto);

        if (response == null) {
            return new ResponseEntity<>("Error al crear notificacion", HttpStatus.BAD_REQUEST);
        } else {
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        }
    }

    @PostMapping("/seleccionar")
    @Operation(description =  "Esta funcion selecciona una nueva notificacion")
    public ResponseEntity<String> seleccionarNotificacion(@RequestBody Long id){
        Notificacion notificacion = notificacionService.buscaNotificacion(id);

        if (notificacion == null) {
            return new ResponseEntity<>("No se encontró la notificación #" + notificacion.getId(), HttpStatus.NOT_FOUND);
        }

        this.notificacionActual = notificacion;

        return new ResponseEntity<>("Notificación actual actualizada #" + notificacion.getId(), HttpStatus.OK);
    }
}

package ti.proyectojava.api.controllers;

import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import ti.proyectojava.api.responses.ResponseListadoNotificacionUsuario;
import ti.proyectojava.dtos.NotificacionUsuarioDto;
import ti.proyectojava.services.NotificacionUsuarioService;

@RestController
@RequestMapping(value = "api/v1/NotificacionesUsuarios")
public class NotificacionUsuarioController {

    private final NotificacionUsuarioService notificacionUsuarioService;

    public NotificacionUsuarioController(NotificacionUsuarioService notificacionUsuarioService) {
        this.notificacionUsuarioService = notificacionUsuarioService;
    }

    @PostMapping("/crear")
    @Secured({"ADMIN"})
    @Operation(description = "Esta Funcion crea una nueva NotificacionUsuario")
    public ResponseEntity<String> crearNotificacionUsuario(@RequestBody NotificacionUsuarioDto notificacionUsuarioDto) {
        String response = notificacionUsuarioService.crearNotificacionUsuario(notificacionUsuarioDto);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{id}/eliminar")
    @Secured({"ADMIN"})
    @Operation(description = "Esta Funcion elimina una nueva NotificacionUsuario")
    public ResponseEntity<String> borrarNotificacionUsuario(@RequestBody Long id){
        String lote = notificacionUsuarioService.borrarNotificacionUsuario(id);

        if (lote == null) {
            return new ResponseEntity<>("No se encontró la NotificacionUsuario. ID:" + id, HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity<>(lote, HttpStatus.OK);

    }

    @GetMapping
    @Secured({"ADMIN"})
    public ResponseEntity<ResponseListadoNotificacionUsuario> getNotificacionUsuario(){
        ResponseListadoNotificacionUsuario response = notificacionUsuarioService.listadoNotificacionUsuario();
        return new ResponseEntity<>(response, HttpStatus.OK);

    }
}

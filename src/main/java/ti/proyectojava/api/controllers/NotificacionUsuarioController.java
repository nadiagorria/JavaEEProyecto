package ti.proyectojava.api.controllers;

import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import ti.proyectojava.api.responses.ResponseListadoNotificacionUsuario;
import ti.proyectojava.services.NotificacionUsuarioService;


@RestController
@RequestMapping(value = "api/v1/NotificacionesUsuarios")
public class NotificacionUsuarioController {

    private final NotificacionUsuarioService notificacionUsuarioService;

    public NotificacionUsuarioController(NotificacionUsuarioService notificacionUsuarioService) {
        this.notificacionUsuarioService = notificacionUsuarioService;
    }



    @PutMapping("/{id}/eliminar")
    @Secured({"ADMIN"})
    @Operation(description = "Esta Funcion elimina una nueva NotificacionUsuario")
    public ResponseEntity<String> borrarNotificacionUsuario(@PathVariable Long id){
        String lote = notificacionUsuarioService.borrarNotificacionUsuario(id);

        if (lote == null) {
            return new ResponseEntity<>("No se encontró la NotificacionUsuario. ID:" + id, HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity<>(lote, HttpStatus.OK);

    }


    @GetMapping("/mis-notificaciones")
    @Secured({"ADMIN", "CAJERO"})
    @Operation(description = "Obtiene las notificaciones del usuario autenticado")
    public ResponseEntity<ResponseListadoNotificacionUsuario> getMisNotificaciones(){
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userName = auth.getName();
        
        ResponseListadoNotificacionUsuario response = notificacionUsuarioService.obtenerNotificacionesPorUsuario(userName);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/{id}/marcar-leida")
    @Secured({"ADMIN", "CAJERO"})
    @Operation(description = "Marca una notificación como leída")
    public ResponseEntity<String> marcarComoLeida(@PathVariable Long id){
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userName = auth.getName();
        
        String response = notificacionUsuarioService.marcarComoLeida(id, userName);
        
        if (response.contains("No se encontró")) {
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contar-no-leidas")
    @Secured({"ADMIN", "CAJERO"})
    @Operation(description = "Cuenta las notificaciones no leídas del usuario")
    public ResponseEntity<Integer> contarNoLeidas(){
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userName = auth.getName();
        
        int count = notificacionUsuarioService.contarNotificacionesNoLeidas(userName);
        return new ResponseEntity<>(count, HttpStatus.OK);
    }

    @PostMapping("/marcar-todas-leidas")
    @Secured({"ADMIN", "CAJERO"})
    @Operation(description = "Marca todas las notificaciones del usuario como leídas")
    public ResponseEntity<String> marcarTodasComoLeidas(){
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userName = auth.getName();
        
        String response = notificacionUsuarioService.marcarTodasComoLeidas(userName);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // Función a borrar al finalizar el proyecto, solo para pruebas
    @PostMapping("/verificar-vencimientos")
    @Secured({"ADMIN"})
    @Operation(description = "Ejecuta manualmente la verificación de lotes próximos a vencer")
    public ResponseEntity<String> ejecutarVerificacionVencimientos(){
        try {
            notificacionUsuarioService.chequearNotificaciones();
            return new ResponseEntity<>("Verificación de vencimientos ejecutada correctamente. Se han generado las notificaciones correspondientes.", HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Error al ejecutar la verificación: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

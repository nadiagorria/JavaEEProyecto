package ti.proyectojava.api.controllers;

import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import ti.proyectojava.api.responses.ResponseListadoNotificacionUsuario;
import ti.proyectojava.dtos.NotificacionUsuarioDto;
import ti.proyectojava.services.NotificacionUsuarioService;

import jakarta.servlet.http.HttpServletRequest;

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

    }    @GetMapping("/mis-notificaciones")
    @Secured({"ADMIN", "CAJERO"})
    @Operation(description = "Obtiene las notificaciones del usuario autenticado")
    public ResponseEntity<ResponseListadoNotificacionUsuario> getMisNotificaciones(){
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userName = auth.getName();
        
        ResponseListadoNotificacionUsuario response = notificacionUsuarioService.obtenerNotificacionesPorUsuario(userName);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }@PutMapping("/{id}/marcar-leida")
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
    }    @GetMapping("/contar-no-leidas")
    @Secured({"ADMIN", "CAJERO"})
    @Operation(description = "Cuenta las notificaciones no leídas del usuario")
    public ResponseEntity<Integer> contarNoLeidas(){
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userName = auth.getName();
        
        int count = notificacionUsuarioService.contarNotificacionesNoLeidas(userName);
        return new ResponseEntity<>(count, HttpStatus.OK);
    }    @PostMapping("/marcar-todas-leidas")
    @Secured({"ADMIN", "CAJERO"})
    @Operation(description = "Marca todas las notificaciones del usuario como leídas")
    public ResponseEntity<String> marcarTodasComoLeidas(){
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userName = auth.getName();
        
        String response = notificacionUsuarioService.marcarTodasComoLeidas(userName);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }    @GetMapping("/debug")
    @Secured({"ADMIN", "CAJERO"})
    @Operation(description = "Endpoint de debug para diagnosticar problemas con notificaciones")
    public ResponseEntity<String> debugNotificaciones(){
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userName = auth.getName();
        
        String debugInfo = notificacionUsuarioService.debugNotificaciones(userName);
        return new ResponseEntity<>(debugInfo, HttpStatus.OK);
    }    @GetMapping("/debug-usuario")
    @Secured({"ADMIN", "CAJERO"})
    @Operation(description = "Endpoint de debug para verificar usuario autenticado y notificaciones")
    public ResponseEntity<String> debugUsuario(HttpServletRequest request) {
        try {
            String userName = SecurityContextHolder.getContext().getAuthentication().getName();
            String debug = notificacionUsuarioService.debugUsuarioYNotificaciones(userName);
            return ResponseEntity.ok(debug);
        } catch (Exception e) {
            return ResponseEntity.ok("Error: " + e.getMessage());
        }
    }

    @GetMapping("/debug-seguridad")
    @Operation(description = "Debug de seguridad para verificar roles y autoridades del usuario")
    public ResponseEntity<String> debugSeguridad(){
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userName = auth.getName();
            
            StringBuilder debug = new StringBuilder();
            debug.append("=== DEBUG DE SEGURIDAD ===\n");
            debug.append("Usuario autenticado: ").append(userName).append("\n");
            debug.append("Tipo de Authentication: ").append(auth.getClass().getSimpleName()).append("\n");
            debug.append("Está autenticado: ").append(auth.isAuthenticated()).append("\n");
            debug.append("Principal: ").append(auth.getPrincipal()).append("\n");
            debug.append("Credentials: ").append(auth.getCredentials() != null ? "Present" : "Null").append("\n");
            
            debug.append("\n=== AUTORIDADES ===\n");
            if (auth.getAuthorities() != null) {
                auth.getAuthorities().forEach(authority -> {
                    debug.append("- ").append(authority.getAuthority()).append("\n");
                });
            } else {
                debug.append("No authorities found\n");
            }
            
            return ResponseEntity.ok(debug.toString());
        } catch (Exception e) {
            return ResponseEntity.ok("Error en debug de seguridad: " + e.getMessage());
        }
    }
}

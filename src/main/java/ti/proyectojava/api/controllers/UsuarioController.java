package ti.proyectojava.api.controllers;

import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import ti.proyectojava.api.responses.ResponseListadoUsuarios;
import ti.proyectojava.dtos.UsuarioDto;
import ti.proyectojava.dtos.RecuperacionPasswordDto;
import ti.proyectojava.services.UsuarioService;

import java.util.Map;

@RestController
@RequestMapping(value = "api/v1/usuarios")
public class UsuarioController {
    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping
    @Secured({"ADMIN"})
    public ResponseEntity<ResponseListadoUsuarios> getUsuarios() {
        ResponseListadoUsuarios response = usuarioService.listadoUsuarios();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @Operation(description = "Esta funcion modifica un usuario")
    @PutMapping("/{nombre}")
    @Secured({"ADMIN"})
    public ResponseEntity<String> modificarUsuario(@PathVariable(name = "nombre") String nombreUsuario, @RequestBody UsuarioDto usuario) {
        String response = usuarioService.modificarUsuario(nombreUsuario, usuario);
        if (response == null) {
            return new ResponseEntity<>("Error al modificar el usuario. NOMBRE:" + nombreUsuario, HttpStatus.BAD_REQUEST);
        } else {
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        }
    }

    @Operation(description = "Esta funcion borra un usuario")
    @PutMapping("/eliminar/{nombre}")
    @Secured({"ADMIN"})
    public ResponseEntity<Void> borrarUsuario(@PathVariable(name = "nombre") String nombreUsuario) {
        usuarioService.borrarUsuario(nombreUsuario);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @Operation(description = "Obtiene el número total de usuarios registrados")
    @GetMapping("/cantidadUsuarios")
    @Secured({"ADMIN", "CAJERO"})
    public ResponseEntity<Integer> getUsuariosTotales() {
        Integer response = usuarioService.listadoUsuariosTotales();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/{nombre}")
    @Operation(description = "Obtiene los datos de un usuario específico")
    @Secured({"ADMIN", "CAJERO"})
    public ResponseEntity<UsuarioDto> obtenerUsuario(@PathVariable(name = "nombre") String nombreUsuario) {
        try {
            UsuarioDto usuario = usuarioService.buscarUsuario(nombreUsuario);
            return ResponseEntity.ok(usuario);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @PostMapping("/otorgar-admin/{usuario}")
    @Operation(description = "Otorga permisos de administrador a un usuario (solo el admin por defecto)")
    @Secured({"ADMIN"})
    public ResponseEntity<String> otorgarRolAdmin(@PathVariable(name = "usuario") String usuarioDestino) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String adminUsuario = authentication.getName();

            String response = usuarioService.otorgarRolAdmin(adminUsuario, usuarioDestino);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/revocar-admin/{usuario}")
    @Operation(description = "Revoca permisos de administrador de un usuario (solo el admin por defecto)")
    @Secured({"ADMIN"})
    public ResponseEntity<String> revocarRolAdmin(@PathVariable(name = "usuario") String usuarioDestino) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String adminUsuario = authentication.getName();

            String response = usuarioService.revocarRolAdmin(adminUsuario, usuarioDestino);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }


    @PostMapping("/solicitar-recuperacion")
    @Operation(description = "Solicita recuperación de contraseña por email")
    public ResponseEntity<String> solicitarRecuperacionPassword(@RequestBody RecuperacionPasswordDto request) {
        try {
            String response = usuarioService.solicitarRecuperacionPassword(request.getEmail());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/restablecer-password")
    @Operation(description = "Restablece la contraseña usando el código de recuperación")
    public ResponseEntity<String> restablecerPassword(@RequestBody RecuperacionPasswordDto request) {
        try {
            String response = usuarioService.restablecerPassword(request.getEmail(), request.getCodigo(), request.getNuevaPassword());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/verificar-password-actual")
    @Operation(description = "Verifica si una contraseña es igual a la actual del usuario")
    public ResponseEntity<Boolean> verificarPasswordActual(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String password = request.get("password");
            
            if (email == null || password == null) {
                return ResponseEntity.badRequest().body(false);
            }
            
            boolean esIgual = usuarioService.esPasswordIgualAActual(email, password);
            return ResponseEntity.ok(esIgual);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(false);
        }
    }

}
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
import ti.proyectojava.services.UsuarioService;

@RestController
@RequestMapping(value = "api/v1/usuarios")
public class UsuarioController {
    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    // esto solo la puede hacer el admin
    @GetMapping
    @Secured({"ADMIN"})
    public ResponseEntity<ResponseListadoUsuarios> getUsuarios(){
            ResponseListadoUsuarios response = usuarioService.listadoUsuarios();
            return new ResponseEntity<>(response, HttpStatus.OK);

    }



    // esto lo hace cualquiera
    @PostMapping
    @Operation(description = "Esta funcion crea un nuevo usuario")
    public ResponseEntity<String> createUsuario(@RequestBody UsuarioDto usuarioDto){

            String response = usuarioService.crearUsuario(usuarioDto);
            if (response == null) {
                return new ResponseEntity<>("Error al crear usuario. NOMBRE:" + usuarioDto.getNombre(), HttpStatus.BAD_REQUEST);
            } else {
                return new ResponseEntity<>(response, HttpStatus.CREATED);
            }

}

    //esto lo puede hacer el admin
    @Operation(description = "Esta funcion modifica un usuario")
    @PutMapping("/{nombre}")
    @Secured({"ADMIN"})
    public ResponseEntity<String> modificarUsuario(@PathVariable (name = "nombre") String nombreUsuario, @RequestBody UsuarioDto usuario){
        String response = usuarioService.modificarUsuario(nombreUsuario, usuario);
        if (response == null){
            return new ResponseEntity<>("Error al modificar el usuario. NOMBRE:" + nombreUsuario, HttpStatus.BAD_REQUEST);
        }else {
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        }
    }

    //esta funcion solo la puede hacer el admin
    @Operation(description = "Esta funcion borra un usuario")
    @PutMapping("/eliminar/{nombre}")
    @Secured({"ADMIN"})
    public ResponseEntity<Void> borrarUsuario(@PathVariable (name = "nombre") String nombreUsuario){
        usuarioService.borrarUsuario(nombreUsuario);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    // controller de chequear notificaciones
}
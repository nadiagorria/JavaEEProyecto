package ti.proyectojava.api.controllers;

import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

    @GetMapping
    public ResponseEntity<ResponseListadoUsuarios> getUsuarios(){
        ResponseListadoUsuarios response = usuarioService.listadoUsuarios();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping
    @Operation(description = "Esta funcion crea un nuevo usuario")
    public ResponseEntity<String> createUsuario(@RequestBody UsuarioDto usuario){
        String response = usuarioService.crearUsuario(usuario);
        if (response == null){
            return new ResponseEntity<>("Error al crear usuario", HttpStatus.BAD_REQUEST);
        }else {
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        }
}

    @PutMapping("/{nombre}")
    public ResponseEntity<String> modificarUsuario(@PathVariable (name = "nombre") String nombreUsuario, @RequestBody UsuarioDto usuario){
        String response = usuarioService.modificarUsuario(nombreUsuario, usuario);
        if (response == null){
            return new ResponseEntity<>("Error al modificar el usuario", HttpStatus.BAD_REQUEST);
        }else {
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        }
    }

    @PutMapping("/eliminar/{nombre}")
    public ResponseEntity<Void> borrarUsuario(@PathVariable (name = "nombre") String nombreUsuario, @RequestBody UsuarioDto usuario){
        usuarioService.borrarUsuario(nombreUsuario);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    // controller de chequear notificaciones
}
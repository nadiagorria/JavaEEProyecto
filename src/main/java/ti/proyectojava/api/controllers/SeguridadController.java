package ti.proyectojava.api.controllers;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import ti.proyectojava.business.entities.Usuario;
import ti.proyectojava.dtos.UsuarioDto;
import ti.proyectojava.dtos.UsuarioSecurityDto;
import ti.proyectojava.security.SeguridadService;
import ti.proyectojava.services.UsuarioService;


import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;


@RestController
@RequestMapping(value = "api/v1/seguridad")
public class SeguridadController {

    @Autowired
    private SeguridadService seguridadService;
    
    @Autowired
    private UsuarioService usuarioService;

    @PostMapping("/autenticacion")
    @Transactional(readOnly = true)
    public ResponseEntity<?> autenticarUsuario(
            @RequestParam("usuario") String usuario,
            @RequestParam("password") String password
    ) {
        try {
            Usuario objUsuario = seguridadService
                    .autenticarUsuario(usuario, password)
                    .orElseThrow(() -> new RuntimeException("ERROR_SERVIDOR"));
            String token = generarToken(objUsuario);
            UsuarioSecurityDto usuarioResponse = new UsuarioSecurityDto(objUsuario.getNombre(),
                            token, seguridadService.listarRolesPorUsuario(objUsuario));
            return new ResponseEntity<>(usuarioResponse, HttpStatus.OK);
        } catch (RuntimeException e) {
            String errorCode = e.getMessage();
            String errorMessage;
            
            switch (errorCode) {
                case "USUARIO_INCORRECTO":
                    errorMessage = "El nombre de usuario o la contraseña son incorrectos.";
                    break;
                case "CONTRASENIA_INCORRECTA":
                    errorMessage = "El nombre de usuario o la contraseña son incorrectos.";
                    break;
                case "USUARIO_INACTIVO":
                    errorMessage = "Este usuario ya no existe.";
                    break;
                default:
                    errorMessage = "Error interno del servidor";
                    errorCode = "ERROR_SERVIDOR";
                    break;            }
            
            return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body("{\"error\": \"" + errorCode + "\", \"message\": \"" + errorMessage + "\"}");
        }
    }

    private String generarToken(Usuario usuario) {
        String clave = "@Z9@vQ3!pL8#wX7^tR2&nG6*yM4$eB1(dF0)sH5%"; // dinamico desde la BD
        List<GrantedAuthority> grantedAuthorityList
                = AuthorityUtils.createAuthorityList(
                        seguridadService.listarRolesPorUsuario(usuario)
                );
        String token = Jwts
                .builder()
                .setId("@mY2#wL7^qK9@zT3!vX5&nR8*pG1$eD4(sF0)dH6%") // Dinámico desde BD
                .setSubject(usuario.getNombre())
                .claim("authorities",
                        grantedAuthorityList.stream()
                                .map(GrantedAuthority::getAuthority)
                                .collect(Collectors.toList())
                )
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + (1000 * 60 * 60 * 8)))
                .signWith(SignatureAlgorithm.HS512, clave.getBytes())
                .compact();
        return token;
    }

    @PostMapping("/registro")
    public ResponseEntity<?> registrarUsuario(
            @RequestParam("username") String username,
            @RequestParam("email") String email,
            @RequestParam("password") String password,
            @RequestParam(value = "admin", defaultValue = "false") boolean isAdmin
    ) {
        try {
            // Validar longitud mínima de contraseña
            if (password.length() < 6) {
                return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("{\"error\": \"CONTRASENIA_CORTA\", \"message\": \"La contraseña debe tener al menos 6 caracteres\"}");
            }

            // Crear DTO del usuario
            UsuarioDto usuarioDto = new UsuarioDto();
            usuarioDto.setNombre(username);
            usuarioDto.setMail(email);
            usuarioDto.setContrasenia(password);
            usuarioDto.setActivo(true); // Establecer usuario como activo al registrarse
            
            // Intentar crear el usuario con rol asignado
            String resultado = usuarioService.crearUsuario(usuarioDto, isAdmin);
            
            if (resultado != null) {
                return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body("{\"success\": true, \"message\": \"Usuario registrado exitosamente\", \"username\": \"" + username + "\"}");
            } else {
                return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("{\"error\": \"ERROR_REGISTRO\", \"message\": \"Error al registrar usuario\"}");
            }
            
        } catch (RuntimeException e) {
            // Manejar errores específicos del servicio
            String errorCode;
            String errorMessage;
            
            switch (e.getMessage()) {
                case "USUARIO_EXISTENTE":
                    errorCode = "USUARIO_EXISTENTE";
                    errorMessage = "El nombre de usuario ya está en uso";
                    break;
                case "EMAIL_EXISTENTE":
                    errorCode = "EMAIL_EXISTENTE";
                    errorMessage = "El email ya está registrado con otro usuario activo";
                    break;
                case "CONTRASENIA_CORTA":
                    errorCode = "CONTRASENIA_CORTA";
                    errorMessage = "La contraseña debe tener al menos 6 caracteres";
                    break;
                case "NOMBRE_CORTO":
                    errorCode = "NOMBRE_CORTO";
                    errorMessage = "El nombre de usuario debe tener al menos 3 caracteres";
                    break;
                case "EMAIL_INVALIDO":
                    errorCode = "EMAIL_INVALIDO";
                    errorMessage = "El formato del email es inválido";
                    break;
                default:
                    errorCode = "ERROR_REGISTRO";
                    errorMessage = e.getMessage();
                    break;
            }
            
            return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body("{\"error\": \"" + errorCode + "\", \"message\": \"" + errorMessage + "\"}");
        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("{\"error\": \"ERROR_SERVIDOR\", \"message\": \"Error interno del servidor\"}");
        }
    }

    @GetMapping("/verificar-usuario/{username}")
    public ResponseEntity<?> verificarUsuario(@PathVariable String username) {
        try {
            boolean existe = seguridadService.existeUsuario(username);
            return ResponseEntity.ok()
                .body("{\"existe\": " + existe + "}");
        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("{\"error\": \"ERROR_SERVIDOR\", \"message\": \"Error al verificar usuario\"}");
        }
    }

    @GetMapping("/verificar-email/{email}")
    public ResponseEntity<?> verificarEmail(@PathVariable String email) {
        try {
            boolean existe = seguridadService.existeEmailActivo(email);
            return ResponseEntity.ok()
                .body("{\"existe\": " + existe + "}");
        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("{\"error\": \"ERROR_SERVIDOR\", \"message\": \"Error al verificar email\"}");
        }
    }

}

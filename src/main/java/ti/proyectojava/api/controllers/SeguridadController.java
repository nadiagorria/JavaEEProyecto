package ti.proyectojava.api.controllers;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import ti.proyectojava.business.entities.Usuario;
import ti.proyectojava.dtos.UsuarioSecurityDto;
import ti.proyectojava.security.SeguridadService;


import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;


@RestController
@RequestMapping("api/v1/seguridad")
public class SeguridadController {

    
    @Autowired
    private SeguridadService seguridadService;

    @PostMapping("/autenticacion")
    @Transactional(readOnly = true)
    public ResponseEntity<UsuarioSecurityDto> autenticarUsuario(
            @RequestParam("usuario") String usuario,
            @RequestParam("password") String password
    ) {
        Usuario objUsuario = seguridadService
                .autenticarUsuario(usuario, password)
                .orElseThrow(() -> new RuntimeException("Usuario o contraseña incorrectos."));
        String token = generarToken(objUsuario);
        UsuarioSecurityDto usuarioResponse
                = new UsuarioSecurityDto(objUsuario.getNombre(),
                        token, seguridadService.listarRolesPorUsuario(objUsuario));
        return new ResponseEntity<>(usuarioResponse, HttpStatus.OK);
    }

    private String generarToken(Usuario usuario) {
        String clave = "@tR8!xG5&wM9@vL2#zQ7^nB4$eY1*pF0)dH3(sK6%"; // dinamico desde la BD
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

}

package ti.proyectojava.security;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ti.proyectojava.business.entities.Usuario;
import ti.proyectojava.business.repositories.UsuarioRepository;
import ti.proyectojava.services.PasswordService;


import java.util.Optional;

@Service
public class SeguridadService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordService passwordService;

    public Optional<Usuario> autenticarUsuario(String usuario, String password) {
        Optional<Usuario> objUsuario = usuarioRepository.findByNombreIgnoreCase(usuario);

        if (objUsuario.isEmpty()) {
            throw new RuntimeException("USUARIO_INCORRECTO");
        }

        Usuario usuarioEncontrado = objUsuario.get();

        if (!usuarioEncontrado.getActivo()) {
            throw new RuntimeException("USUARIO_INACTIVO");
        }

        if (!passwordService.matchPassword(password, usuarioEncontrado.getContrasenia())) {
            throw new RuntimeException("CONTRASENIA_INCORRECTA");
        }

        return objUsuario;
    }

    public String[] listarRolesPorUsuario(Usuario usuario) {
        String[] lisRoles = new String[usuario.getRoles().size()];
        for (int i = 0; i < usuario.getRoles().size(); i++) {
            lisRoles[i] = usuario.getRoles().get(i).getNombre();
        }
        return lisRoles;
    }

    public boolean existeUsuario(String nombreUsuario) {
        return usuarioRepository.findByNombreIgnoreCase(nombreUsuario).isPresent();
    }

    public boolean existeEmailActivo(String email) {
        return usuarioRepository.findByMailIgnoreCaseAndActivoTrue(email).isPresent();
    }

}

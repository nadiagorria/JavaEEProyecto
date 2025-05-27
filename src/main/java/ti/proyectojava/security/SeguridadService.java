package ti.proyectojava.security;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ti.proyectojava.business.entities.Usuario;
import ti.proyectojava.business.repositories.UsuarioRepository;


import java.util.Optional;

@Service
public class SeguridadService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    public Optional<Usuario> autenticarUsuario(String usuario,
                                               String password) {
        Optional<Usuario> objUsuario
                = usuarioRepository.findByNombreAndContrasenia(usuario, password);
        if (objUsuario.isEmpty()) {
            return Optional.empty();
        } else if (!objUsuario.get().getActivo()) {
            return Optional.empty();
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
        return usuarioRepository.findByNombre(nombreUsuario).isPresent();
    }

}

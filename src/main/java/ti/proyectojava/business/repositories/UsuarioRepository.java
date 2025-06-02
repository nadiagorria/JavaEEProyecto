package ti.proyectojava.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import ti.proyectojava.business.entities.Usuario;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, String> {
    Optional<Usuario> findByNombreAndContrasenia(String nombre, String contrasenia);
    Optional<Usuario> findByNombre(String nombre);
    List<Usuario> findByActivoTrue();
    Usuario findByMail(String mail);
    
    // Métodos insensibles a mayúsculas y minúsculas
    Optional<Usuario> findByNombreIgnoreCaseAndContrasenia(String nombre, String contrasenia);
    Optional<Usuario> findByNombreIgnoreCase(String nombre);

    @Query("SELECT COUNT(u.id) as usuariosTotales FROM Usuario u")
    int cantidadUsuarios();
}

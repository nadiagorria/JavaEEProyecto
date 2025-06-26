package ti.proyectojava.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import ti.proyectojava.business.entities.Usuario;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, String> {
    Optional<Usuario> findByNombre(String nombre);

    List<Usuario> findByActivoTrue();

    Optional<Usuario> findByNombreIgnoreCase(String nombre);

    Optional<Usuario> findByMailIgnoreCaseAndActivoTrue(String mail);

    @Query("SELECT COUNT(u.id) as usuariosTotales FROM Usuario u WHERE u.activo = true")
    int cantidadUsuarios();

}

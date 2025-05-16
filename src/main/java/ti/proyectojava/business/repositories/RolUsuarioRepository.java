package ti.proyectojava.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import ti.proyectojava.business.entities.Categoria;
import ti.proyectojava.business.entities.RolUsuario;

import java.util.Optional;

public interface RolUsuarioRepository extends JpaRepository<RolUsuario, Long> {
    Optional<RolUsuario> findById(Long id);
}

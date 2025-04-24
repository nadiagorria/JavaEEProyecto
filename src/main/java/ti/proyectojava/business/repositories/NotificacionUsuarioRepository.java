package ti.proyectojava.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import ti.proyectojava.business.entities.NotificacionUsuario;
import ti.proyectojava.business.entities.Producto;

import java.util.List;

public interface NotificacionUsuarioRepository extends JpaRepository<NotificacionUsuario, Long> {
    List<NotificacionUsuario> findByActivoTrue();
}

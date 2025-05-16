package ti.proyectojava.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import ti.proyectojava.business.entities.Categoria;
import ti.proyectojava.business.entities.Notificacion;
import ti.proyectojava.business.entities.NotificacionUsuario;
import ti.proyectojava.business.entities.Producto;

import java.util.List;
import java.util.Optional;

public interface NotificacionUsuarioRepository extends JpaRepository<NotificacionUsuario, Long> {
    List<NotificacionUsuario> findByActivoTrue();
    Optional<NotificacionUsuario> findById(Long id);
}

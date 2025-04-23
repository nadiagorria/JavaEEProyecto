package ti.proyectojava.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ti.proyectojava.business.entities.Notificacion;

@Repository
public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {
}

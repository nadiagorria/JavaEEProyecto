package ti.proyectojava.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ti.proyectojava.business.entities.Promocion;

@Repository
public interface PromocionRepository extends JpaRepository<Promocion, Long> {
}

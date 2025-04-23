package ti.proyectojava.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ti.proyectojava.business.entities.Descuento;

@Repository
public interface DescuentoRepository extends JpaRepository<Descuento, Long> {
}

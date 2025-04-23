package ti.proyectojava.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ti.proyectojava.business.entities.Venta;

@Repository
public interface VentaRepository extends JpaRepository<Venta, Long> {
}

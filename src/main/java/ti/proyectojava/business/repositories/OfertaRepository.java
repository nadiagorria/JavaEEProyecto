package ti.proyectojava.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ti.proyectojava.business.entities.Oferta;

@Repository
public interface OfertaRepository extends JpaRepository<Oferta, Long> {
}

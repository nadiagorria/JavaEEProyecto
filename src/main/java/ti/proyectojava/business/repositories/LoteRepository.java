package ti.proyectojava.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ti.proyectojava.business.entities.Lote;

@Repository
public interface LoteRepository extends JpaRepository<Lote, Long> {

}

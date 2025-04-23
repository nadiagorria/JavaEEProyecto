package ti.proyectojava.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ti.proyectojava.business.entities.Combo;

@Repository
public interface ComboRepository extends JpaRepository<Combo, Long> {
}

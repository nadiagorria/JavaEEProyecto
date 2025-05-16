package ti.proyectojava.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ti.proyectojava.business.entities.Categoria;
import ti.proyectojava.business.entities.Credito;

import java.util.Optional;

@Repository
public interface CreditoRepository extends JpaRepository<Credito, Long> {
    Optional<Credito> findById(Long id);
}

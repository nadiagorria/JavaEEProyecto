package ti.proyectojava.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ti.proyectojava.business.entities.Cantidad;
import ti.proyectojava.business.entities.Categoria;

import java.util.Optional;

@Repository
public interface CantidadRepository extends JpaRepository<Cantidad, Long> {
    Optional<Cantidad> findById(Long id);
}

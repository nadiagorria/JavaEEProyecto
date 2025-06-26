package ti.proyectojava.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ti.proyectojava.business.entities.Entidad;

import java.util.Optional;

@Repository
public interface EntidadRepository extends JpaRepository<Entidad, Long> {
    Optional<Entidad> findById(Long id);

}
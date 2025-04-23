package ti.proyectojava.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ti.proyectojava.business.entities.Cliente;
@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {
}
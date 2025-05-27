package ti.proyectojava.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ti.proyectojava.business.entities.Categoria;
import ti.proyectojava.business.entities.Descuento;

import java.util.List;
import java.util.Optional;

@Repository
public interface DescuentoRepository extends JpaRepository<Descuento, Long> {
    List<Descuento> findByActivoTrue();
    Optional<Descuento> findById(Long id);
    List<Descuento> findByProducto_Id(Long productoId);
}

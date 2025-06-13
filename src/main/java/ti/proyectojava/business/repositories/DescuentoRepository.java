package ti.proyectojava.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ti.proyectojava.business.entities.Categoria;
import ti.proyectojava.business.entities.Descuento;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DescuentoRepository extends JpaRepository<Descuento, Long> {
    List<Descuento> findByActivoTrue();
    Optional<Descuento> findById(Long id);
    List<Descuento> findByProducto_Id(Long productoId);
      // Buscar descuentos activos que se superpongan en fechas para un producto específico
    @Query("SELECT d FROM Descuento d WHERE d.producto.id = :productoId " +
           "AND d.activo = true " +
           "AND d.id != :descuentoId " +
           "AND ((d.inicio <= :fechaFin AND d.fin >= :fechaInicio))")
    List<Descuento> buscarDescuentosActivosSolapados(
        @Param("productoId") Long productoId,
        @Param("descuentoId") Long descuentoId,
        @Param("fechaInicio") LocalDate fechaInicio,
        @Param("fechaFin") LocalDate fechaFin
    );
}

package ti.proyectojava.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ti.proyectojava.business.entities.Promocion;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PromocionRepository extends JpaRepository<Promocion, Long> {
    List<Promocion> findByActivoTrue();

    Optional<Promocion> findById(Long id);

    List<Promocion> findByProducto_Id(Long productoId);

    @Query("SELECT p FROM Promocion p WHERE p.producto.id = :productoId " +
            "AND p.activo = true " +
            "AND p.id != :promocionId " +
            "AND ((p.inicio <= :fechaFin AND p.fin >= :fechaInicio))")
    List<Promocion> buscarPromocionesActivasSolapadas(
            @Param("productoId") Long productoId,
            @Param("promocionId") Long promocionId,
            @Param("fechaInicio") LocalDate fechaInicio,
            @Param("fechaFin") LocalDate fechaFin
    );
}

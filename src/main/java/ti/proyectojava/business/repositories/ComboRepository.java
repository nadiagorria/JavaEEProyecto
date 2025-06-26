package ti.proyectojava.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ti.proyectojava.business.entities.Combo;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ComboRepository extends JpaRepository<Combo, Long> {
    List<Combo> findByActivoTrue();

    Optional<Combo> findById(Long id);

    List<Combo> findByProductos_Id(Long productoId);

    @Query("SELECT c FROM Combo c JOIN c.productos p WHERE p.id IN :productosIds " +
            "AND c.activo = true " +
            "AND c.id != :comboId " +
            "AND ((c.inicio <= :fechaFin AND c.fin >= :fechaInicio))")
    List<Combo> buscarCombosActivosSolapados(
            @Param("productosIds") List<Long> productosIds,
            @Param("comboId") Long comboId,
            @Param("fechaInicio") LocalDate fechaInicio,
            @Param("fechaFin") LocalDate fechaFin
    );
}

package ti.proyectojava.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import ti.proyectojava.business.entities.Venta;

import java.util.List;
import java.util.Optional;

@Repository
public interface VentaRepository extends JpaRepository<Venta, Long> {
    List<Venta> findByActivoTrue();

    List<Venta> findByActivoTrueAndUsuarioNombre(String nombreUsuario);

    Optional<Venta> findById(Long id);

    @Query("SELECT COUNT(v.id) as ventasTotales FROM Venta v")
    int cantidadVentas();
}

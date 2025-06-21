package ti.proyectojava.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import ti.proyectojava.business.entities.Cantidad;

import java.util.List;
import java.util.Optional;

@Repository
public interface CantidadRepository extends JpaRepository<Cantidad, Long> {
    Optional<Cantidad> findById(Long id);

    @Query("SELECT c.producto, SUM(c.cantidad) as totalVendido FROM Cantidad c " +
            "WHERE c.producto.activo = true " +
            "GROUP BY c.producto " +
            "ORDER BY totalVendido DESC")
    List<Object[]> findTopBestSellingProducts();

    @Query("SELECT p.categoria, SUM(c.cantidad) as totalVendido FROM Cantidad c " +
            "JOIN c.producto p " +
            "WHERE p.activo = true AND p.categoria.activo = true " +
            "GROUP BY p.categoria " +
            "ORDER BY totalVendido DESC")
    List<Object[]> findTopBestSellingCategories();
}

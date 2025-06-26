package ti.proyectojava.business.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ti.proyectojava.business.entities.Venta;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VentaRepository extends JpaRepository<Venta, Long> {
    List<Venta> findByActivoTrue();
    
    Page<Venta> findByActivoTrue(Pageable pageable);

    List<Venta> findByActivoTrueAndUsuarioNombre(String nombreUsuario);
    
    Page<Venta> findByActivoTrueAndUsuarioNombre(String nombreUsuario, Pageable pageable);

    Optional<Venta> findById(Long id);

    @Query("SELECT COUNT(v.id) as ventasTotales FROM Venta v")
    int cantidadVentas();

    // Consultas con filtros de fecha usando LocalDateTime
    @Query("SELECT v FROM Venta v WHERE v.activo = true " +
           "AND v.fechaVenta >= :fechaDesde AND v.fechaVenta <= :fechaHasta")
    Page<Venta> findByActivoTrueAndFechaVentaBetween(@Param("fechaDesde") LocalDateTime fechaDesde, 
                                                     @Param("fechaHasta") LocalDateTime fechaHasta, 
                                                     Pageable pageable);

    @Query("SELECT v FROM Venta v WHERE v.activo = true " +
           "AND v.usuario.nombre = :nombreUsuario " +
           "AND v.fechaVenta >= :fechaDesde AND v.fechaVenta <= :fechaHasta")
    Page<Venta> findByActivoTrueAndUsuarioNombreAndFechaVentaBetween(@Param("nombreUsuario") String nombreUsuario,
                                                                     @Param("fechaDesde") LocalDateTime fechaDesde, 
                                                                     @Param("fechaHasta") LocalDateTime fechaHasta, 
                                                                     Pageable pageable);

    @Query("SELECT v FROM Venta v WHERE v.activo = true AND v.fechaVenta >= :fechaDesde")
    Page<Venta> findByActivoTrueAndFechaVentaGreaterThanEqual(@Param("fechaDesde") LocalDateTime fechaDesde, 
                                                              Pageable pageable);

    @Query("SELECT v FROM Venta v WHERE v.activo = true AND v.fechaVenta <= :fechaHasta")
    Page<Venta> findByActivoTrueAndFechaVentaLessThanEqual(@Param("fechaHasta") LocalDateTime fechaHasta, 
                                                           Pageable pageable);

    @Query("SELECT v FROM Venta v WHERE v.activo = true " +
           "AND v.usuario.nombre = :nombreUsuario AND v.fechaVenta >= :fechaDesde")
    Page<Venta> findByActivoTrueAndUsuarioNombreAndFechaVentaGreaterThanEqual(@Param("nombreUsuario") String nombreUsuario,
                                                                              @Param("fechaDesde") LocalDateTime fechaDesde, 
                                                                              Pageable pageable);

    @Query("SELECT v FROM Venta v WHERE v.activo = true " +
           "AND v.usuario.nombre = :nombreUsuario AND v.fechaVenta <= :fechaHasta")
    Page<Venta> findByActivoTrueAndUsuarioNombreAndFechaVentaLessThanEqual(@Param("nombreUsuario") String nombreUsuario,
                                                                           @Param("fechaHasta") LocalDateTime fechaHasta, 
                                                                           Pageable pageable);
}

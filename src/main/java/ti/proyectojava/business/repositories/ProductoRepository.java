package ti.proyectojava.business.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ti.proyectojava.business.entities.Producto;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
    List<Producto> findByActivoTrue();
    
    Page<Producto> findByActivoTrue(Pageable pageable);

    Optional<Producto> findById(Long id);

    Optional<Producto> findByCodigoDeBarraAndActivoTrue(String codigoDeBarra);

    List<Producto> findAllByCodigoDeBarraAndActivoTrue(String codigoDeBarra);

    @Query("SELECT p FROM Producto p WHERE p.activo = true " +
           "AND (:busqueda IS NULL OR :busqueda = '' OR " +
           "LOWER(p.nombre) LIKE LOWER(CONCAT('%', :busqueda, '%')) OR " +
           "LOWER(p.codigoDeBarra) LIKE LOWER(CONCAT('%', :busqueda, '%'))) " +
           "AND (:categoriaId IS NULL OR " +
           "(:categoriaId IS NOT NULL AND p.categoria IS NOT NULL AND " +
           "(p.categoria.id = :categoriaId OR " +
           "(p.categoria.categoriaPadre IS NOT NULL AND p.categoria.categoriaPadre.id = :categoriaId) OR " +
           "EXISTS (SELECT 1 FROM Categoria c WHERE c.categoriaPadre IS NOT NULL AND c.categoriaPadre.id = :categoriaId AND p.categoria.id = c.id))))")
    Page<Producto> findByActivoTrueWithFilters(@Param("busqueda") String busqueda, 
                                               @Param("categoriaId") Long categoriaId, 
                                               Pageable pageable);

    @Query("SELECT p FROM Producto p WHERE p.activo = true " +
           "AND (:busqueda IS NULL OR :busqueda = '' OR " +
           "LOWER(p.nombre) LIKE LOWER(CONCAT('%', :busqueda, '%')) OR " +
           "LOWER(p.codigoDeBarra) LIKE LOWER(CONCAT('%', :busqueda, '%')))")
    Page<Producto> findByActivoTrueWithTextSearch(@Param("busqueda") String busqueda, 
                                                  Pageable pageable);

}

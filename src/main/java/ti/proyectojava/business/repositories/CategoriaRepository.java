package ti.proyectojava.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ti.proyectojava.business.entities.Categoria;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
    List <Categoria> findByActivoTrue();
    Optional <Categoria> findByNombre(String nombre);
}

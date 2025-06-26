package ti.proyectojava.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import ti.proyectojava.business.entities.PasswordRecovery;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PasswordRecoveryRepository extends JpaRepository<PasswordRecovery, Long> {

    Optional<PasswordRecovery> findByEmailAndCodigoRecuperacionAndUsadoFalse(String email, String codigo);

    List<PasswordRecovery> findByEmailAndUsadoFalse(String email);

    @Modifying
    @Transactional
    void deleteByFechaExpiracionBefore(LocalDateTime fecha);
}

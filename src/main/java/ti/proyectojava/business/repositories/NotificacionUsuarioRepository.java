package ti.proyectojava.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ti.proyectojava.business.entities.Categoria;
import ti.proyectojava.business.entities.Notificacion;
import ti.proyectojava.business.entities.NotificacionUsuario;
import ti.proyectojava.business.entities.Producto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface NotificacionUsuarioRepository extends JpaRepository<NotificacionUsuario, Long> {
    List<NotificacionUsuario> findByActivoTrue();
    Optional<NotificacionUsuario> findById(Long id);
    
    @Query("SELECT nu FROM NotificacionUsuario nu JOIN nu.notificaciones n WHERE nu.activo = true AND n.fechaHora > :fechaLimite")
    List<NotificacionUsuario> findByActivoTrueAndNotificaciones_FechaHoraAfter(@Param("fechaLimite") LocalDateTime fechaLimite);    // Métodos que buscan por email (originales)
    List<NotificacionUsuario> findByActivoTrueAndUsuarios_Mail(String userMail);
    List<NotificacionUsuario> findByActivoTrueAndLeidoFalseAndUsuarios_Mail(String userMail);
    
    // Métodos que buscan por nombre de usuario (nuevos)
    List<NotificacionUsuario> findByActivoTrueAndUsuarios_Nombre(String userName);
    List<NotificacionUsuario> findByActivoTrueAndLeidoFalseAndUsuarios_Nombre(String userName);
}

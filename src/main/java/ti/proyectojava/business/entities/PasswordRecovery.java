package ti.proyectojava.business.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "password_recovery")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PasswordRecovery {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String codigoRecuperacion;
    
    @Column(nullable = false)
    private LocalDateTime fechaCreacion;
    
    @Column(nullable = false)
    private LocalDateTime fechaExpiracion;
    
    @Column(nullable = false)
    private boolean usado = false;
    
    public PasswordRecovery(String email, String codigoRecuperacion, LocalDateTime fechaExpiracion) {
        this.email = email;
        this.codigoRecuperacion = codigoRecuperacion;
        this.fechaCreacion = LocalDateTime.now();
        this.fechaExpiracion = fechaExpiracion;
        this.usado = false;
    }
}

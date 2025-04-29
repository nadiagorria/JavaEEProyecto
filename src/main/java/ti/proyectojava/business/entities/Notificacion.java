package ti.proyectojava.business.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "NOTIFICACION")
public class Notificacion {

    @Id
    @Column(name = "NOTIFICACION_ID")
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(name = "NOTIFICACION_MENSAJES")
    private List<String> mensajes;

    @ManyToMany(cascade = CascadeType.ALL)
    @JoinTable(
            name = "NOTIFICACION_NOTIFICACIONUSUARIO",
            joinColumns = @JoinColumn(name = "NOTIFICACION_ID"),
            inverseJoinColumns = @JoinColumn(name = "NOTIFICACIONUSUARIO_ID"))
    private List <NotificacionUsuario> notificacionUsuarios;

    @Column(name = "NOTIFICACION_FECHA")
    private LocalDateTime fechaHora;
}

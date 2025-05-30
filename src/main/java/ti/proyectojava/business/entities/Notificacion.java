package ti.proyectojava.business.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Data
@Entity
@Table(name = "NOTIFICACION")
public class Notificacion {

    @Id
    @Column(name = "NOTIFICACION_ID")
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(name= "TITULO")
    private String titulo;

    @Column(name = "NOTIFICACION_MENSAJE")
    private String mensaje;

    @ManyToMany(cascade = CascadeType.ALL)
    @JoinTable(
            name = "NOTIFICACION_NOTIFICACIONUSUARIO",
            joinColumns = @JoinColumn(name = "NOTIFICACION_ID"),
            inverseJoinColumns = @JoinColumn(name = "NOTIFICACIONUSUARIO_ID"))
    private List <NotificacionUsuario> notificacionUsuarios = new ArrayList<>();

    @Column(name = "NOTIFICACION_FECHA")
    private LocalDateTime fechaHora;
}

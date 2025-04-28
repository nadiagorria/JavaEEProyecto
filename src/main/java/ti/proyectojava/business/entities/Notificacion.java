package ti.proyectojava.business.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Data
@Entity
@Table(name = "NOTIFICACION")
public class Notificacion {

    @Id
    @Column(name = "NOTIFICACION_ID")
    @GeneratedValue(strategy = GenerationType.AUTO)
    Long id;

    @ElementCollection
    @CollectionTable(name = "NOTIFICACION_MENSAJES", joinColumns = @JoinColumn(name = "NOTIFICACION_ID"))
    @Column(name = "NOTIFICACION_MENSAJES")
    List<String> mensajes;

    @ManyToMany(cascade = CascadeType.ALL)
    @JoinTable(
            name = "NOTIFICACION_NOTIFICACIONUSUARIO",
            joinColumns = @JoinColumn(name = "NOTIFICACION_ID"),
            inverseJoinColumns = @JoinColumn(name = "NOTIFICACIONUSUARIO_ID"))
    List <NotificacionUsuario> notificacionUsuarios;
}

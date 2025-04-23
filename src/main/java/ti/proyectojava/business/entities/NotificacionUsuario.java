package ti.proyectojava.business.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Data
@Entity
@Table(name = "NOTIFICACIONUSUARIO")
public class NotificacionUsuario {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "NOTIFICACIONUSUARIO_ID")
    private long id;

    @Column(name = "NOTIFICACIONUSUARIO_LEIDO")
    private Boolean leido;

    @ManyToMany(mappedBy = "notificacionUsuarios")
    private List<Notificacion> notificaciones;

    @ManyToMany(mappedBy = "notificaciones")
    private List<Usuario> usuarios;

    private Boolean activo;

}

package ti.proyectojava.business.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Data
@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@Table(name = "USUARIO")
public class Usuario {

    @Column (name = "USUARIO_MAIL")
    private String mail;

    @Id
    @Column (name = "USUARIO_NOMBRE")
    private String nombre;

    @Column(name = "USUARIO_CONTRASENIA")
    private String contrasenia;

    @Column(name = "USUARIO_ACTIVO")
    private Boolean activo;

    @ManyToMany (cascade = CascadeType.ALL)
    @JoinTable(name = "USUARIOS_ROLES",
            joinColumns = @JoinColumn (name = "USUARIO"),
            inverseJoinColumns = @JoinColumn (name = "ROL_ID"))
    private List<RolUsuario> roles;

    @ManyToMany
    @JoinTable(
            name = "USUARIONOTIFICACION",
            joinColumns = @JoinColumn(name = "USUARIO_NOMBRE"),
            inverseJoinColumns = @JoinColumn(name = "NOTIFICACIONUSUARIO_ID")
    )
    private List<NotificacionUsuario> notificaciones;


}

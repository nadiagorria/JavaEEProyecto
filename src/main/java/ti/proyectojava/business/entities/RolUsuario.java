package ti.proyectojava.business.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.List;
import java.util.ArrayList;

@Getter
@Setter
@Entity
@Table(name = "ROLES")
public class RolUsuario implements Serializable {
    @Id
    @Column(name = "ROL_ID")
    private Long id;

    @Column(name = "ROL_NOMBRE")
    private String nombre;

    @JsonIgnore
    @ManyToMany(mappedBy = "roles")
    private List<Usuario> usuarios = new ArrayList<>();
}

package ti.proyectojava.business.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.util.Objects;

@Data
@MappedSuperclass

public class Entidad {

    @Column(name = "PERSONA_NOMBRE")
    private String nombre;

    @Column(name = "PERSONA_TELEFONO")
    private String telefono;

    @Column(name = "ENTIDAD_ACTIVO")
    private boolean activo;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "PERSONA_ID")
    private Long id;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Entidad entidad = (Entidad) o;
        return Objects.equals(id, entidad.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
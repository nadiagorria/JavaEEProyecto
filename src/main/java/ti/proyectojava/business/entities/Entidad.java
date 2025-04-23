package ti.proyectojava.business.entities;

import jakarta.persistence.*;
import lombok.Data;

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
}
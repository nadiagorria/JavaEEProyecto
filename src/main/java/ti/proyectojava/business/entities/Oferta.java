package ti.proyectojava.business.entities;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "OFERTA")
@Inheritance(strategy = InheritanceType.JOINED)
public class Oferta {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "OFERTA_ID")
    private Long id;

    @Column(name = "OFERTA_DESCUENTO")
    private float descuento;

    @Column(name = "OFERTA_ACTIVO")
    private Boolean activo;

}

package ti.proyectojava.business.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Data
@Entity
@Table(name = "OFERTA")
@Inheritance(strategy = InheritanceType.JOINED)
public class Oferta {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)    @Column(name = "OFERTA_ID")
    private Long id;

    @Column(name = "OFERTA_DESCRIPCION")
    private String descripcion;

    @Column(name = "OFERTA_DESCUENTO")
    private float descuento;

    @Column(name = "OFERTA_ACTIVO")
    private Boolean activo;

    @Column(name = "OFERTA_INICIO")
    private LocalDate inicio;

    @Column(name = "OFERTA_FIN")
    private LocalDate fin;
}

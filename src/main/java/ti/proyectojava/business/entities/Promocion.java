package ti.proyectojava.business.entities;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "PROMOCION")
public class Promocion extends Oferta{

    @Column(name = "PROMOCION_DESCRIPCION")
    private String descripcion;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "PRODUCTO_ID")
    private Producto producto;

}

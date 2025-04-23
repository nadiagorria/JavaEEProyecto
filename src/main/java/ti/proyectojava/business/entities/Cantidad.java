package ti.proyectojava.business.entities;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "CANTIDAD")
public class Cantidad{

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "CANTIDAD_ID")
    private Long id;

    @Column(name = "CANTIDAD_CANTIDAD")
    private int cantidad;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "PRODUCTO_ID")
    private Producto producto;

    @ManyToOne
    @JoinColumn(name="VENTA_ID")
    private Venta venta;
}


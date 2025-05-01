package ti.proyectojava.business.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.util.Date;

@Data
@Entity
@Table(name = "LOTE")
public class Lote {
    @Id
    @Column(name = "LOTE_ID")
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(name = "LOTE_NUMERO")
    private String numero;

    @Column(name = "STOCK")
    private Integer stock;

    @Column(name = "FECHAVENCIMIENTO")
    private Date fechaVencimiento;

    @Column(name = "PRECIOCOMPRA")
    private Float precioCompra;


    @ManyToOne
    @JoinColumn(name = "PRODUCTO_ID")
    private Producto producto;

    @Column(name = "LOTE_ACTIVO")
    private Boolean activo;
}

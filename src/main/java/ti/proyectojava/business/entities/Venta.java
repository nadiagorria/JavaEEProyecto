package ti.proyectojava.business.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.util.Date;
import java.util.List;

@Data
@Entity
@Table(name = "VENTA")
public class Venta {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "VENTA_ID")
    private Long id;

    @Column(name = "VENTA_FECHA")
    private Date fechaVenta;

    @Column(name = "VENTA_TOTAL")
    private float total;

    @Column(name = "VENTA_ACTIVO")
    private Boolean activo;

    @ManyToOne
    @JoinColumn(name = "credito_id")
    private Credito credito;

    @OneToMany(mappedBy = "venta", cascade = CascadeType.ALL)
    private List<Cantidad> cantidades;

}

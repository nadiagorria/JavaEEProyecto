package ti.proyectojava.business.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.util.Date;
import java.util.List;
import java.util.ArrayList;

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

    @Column(name = "VENTA_FINALIZADA")
    private Boolean finalizada;

    @ManyToOne
    @JoinColumn(name = "credito_id")
    private Credito credito;

    @ManyToOne
    @JoinColumn(name = "USUARIO_NOMBRE")
    private Usuario usuario;

    @OneToMany(mappedBy = "venta", cascade = CascadeType.ALL)
    private List<Cantidad> cantidades = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "VENTA_FORMA_PAGO")
    private FormaDePago formaPago;

}

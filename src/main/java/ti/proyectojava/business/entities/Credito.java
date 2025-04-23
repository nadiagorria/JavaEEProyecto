package ti.proyectojava.business.entities;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "CREDITO")
public class Credito {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    @Column(name = "CREDITO_PRECIO_TOTAL")
    private float precioTotal;
    @Column(name = "CREDITO_MINIMO")
    private float minimo;
    @Column(name = "CREDITO_MAXIMO")
    private float maximo;
    @Column(name = "CREDITO_PAGO_HASTA_AHORA")
    private float pagoHastaAhora;

    @OneToOne
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;
}
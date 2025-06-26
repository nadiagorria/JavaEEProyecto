package ti.proyectojava.business.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

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

    @Column(name = "CREDITO_ACTIVO")
    private Boolean activo;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;

    @OneToMany(mappedBy = "credito")
    private List<Venta> ventas = new ArrayList<>();

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Credito credito = (Credito) o;
        return Objects.equals(id, credito.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
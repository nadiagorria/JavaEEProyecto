package ti.proyectojava.business.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.Data;

import java.util.List;

@Data
@Entity
@Table(name = "COMBO")
public class Combo extends Oferta{
    @Column(name = "COMBO_DESCRIPCION")
    private String descripcion;

    @ManyToMany(mappedBy = "combos")
    private List<Producto> productos;
}

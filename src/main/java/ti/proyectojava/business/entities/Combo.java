package ti.proyectojava.business.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;
import java.util.ArrayList;

@Data
@Entity
@Table(name = "COMBO")
public class Combo extends Oferta {

    @ManyToMany(mappedBy = "combos")
    private List<Producto> productos = new ArrayList<>();
}

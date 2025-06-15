package ti.proyectojava.business.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.Data;

import java.util.List;
import java.util.ArrayList;

@Data
@Entity
@Table(name = "COMBO")
public class Combo extends Oferta{

    @ManyToMany(mappedBy = "combos")
    private List<Producto> productos = new ArrayList<>();
}

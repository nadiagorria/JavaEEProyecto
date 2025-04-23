package ti.proyectojava.business.entities;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;

import java.util.List;

@Data
@Entity
@Table(name = "PROVEEDOR")
public class Proveedor extends Entidad {

    @Column(name = "PROVEEDOR_CORREO", unique = true)
    private String correo;

    @OneToMany(mappedBy = "proveedor")
    private List<Producto> productos;
}
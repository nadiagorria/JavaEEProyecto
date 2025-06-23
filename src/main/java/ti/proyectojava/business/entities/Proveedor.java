package ti.proyectojava.business.entities;


import jakarta.persistence.*;
import lombok.Data;

import java.util.List;
import java.util.ArrayList;

@Data
@Entity
@Table(name = "PROVEEDOR")
public class Proveedor extends Entidad {

    @Column(name = "PROVEEDOR_CORREO")
    private String correo;

    @OneToMany(mappedBy = "proveedor")
    private List<Producto> productos = new ArrayList<>();
}
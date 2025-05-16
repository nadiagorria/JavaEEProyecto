package ti.proyectojava.business.entities;

import jakarta.persistence.*;
import lombok.Data;
import java.util.ArrayList;

import java.util.List;

@Data
@Entity
@Table(name = "CATEGORIA")
public class Categoria {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "CATEGORIA_ID")
    private Long id;

    @Column(name = "CATEGORIA_NOMBRE")
    private String nombre;

    @Column(name = "CATEGORIA_ACTIVO")
    private Boolean activo;

    @ManyToMany
    @JoinTable(
            name = "CATEGORIARELACION",
            joinColumns = @JoinColumn(name = "CATEGORIAPADRE"),
            inverseJoinColumns = @JoinColumn(name = "SUBCATEGORIA")
    )
    @ManyToOne
    @JoinColumn(name = "CATEGORIA_PADRE")
    private Categoria categoriaPadre;

    @OneToMany(mappedBy = "categoriaPadre", cascade = CascadeType.ALL)
    private List<Categoria> subcategorias = new ArrayList<>();

    @OneToMany(mappedBy = "categoria")
    private List<Producto> productos = new ArrayList<>();

}

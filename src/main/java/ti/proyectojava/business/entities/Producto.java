package ti.proyectojava.business.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Data
@Entity
@Table(name = "PRODUCTO")
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PRODUCTO_ID")
    private Long id;

    @Column(name = "PRODUCTO_PRECIOCOMPRA")
    private float precioCompra;

    @Column(name = "PRODUCTO_PRECIOVENTA")
    private float precioVenta;

    @Column(name = "PRODUCTO_CODIGODEBARRA")
    private String codigoDeBarra;

    @Column(name = "PRODUCTO_STOCKMIN")
    private int stockMin;

    @Column(name = "PRODUCTO_STOCKTOTAL")
    private int stockTotal;

    @Column(name = "PRODUCTO_NOMBRE")
    private String nombre;

    @Column(name = "PRODUCTO_IMAGEN")
    private byte[] imagen;

    @OneToMany(mappedBy = "producto")
    private List<Promocion> promociones;

    @ManyToMany(cascade = CascadeType.ALL)
    @JoinTable(
            name = "COMBO_PRODUCTO",
            joinColumns = @JoinColumn(name = "PRODUCTO_ID"),
            inverseJoinColumns = @JoinColumn(name = "COMBO_ID"))
    private List<Combo> combos;

    @OneToMany(mappedBy = "producto")
    private List<Descuento> descuentos;
    
    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "CATEGORIA_NOMBRE")
    private Categoria categoria;

    @ManyToOne
    @JoinColumn(name = "PROVEEDOR_ID")
    private Proveedor proveedor;


    @OneToMany(mappedBy = "producto")
    private List<Lote> lotes;

    @OneToMany(mappedBy = "producto")
    private List<Cantidad> cantidades;

    @Column(name = "PRODUCTO_ACTIVO")
    private Boolean activo;


}

package ti.proyectojava.dtos;

import lombok.Data;

import java.util.List;

@Data
public class ProductoDto {

    private Long id;

    private float precioCompra;

    private float precioVenta;

    private String codigoDeBarra;

    private int stockMin;

    private int stockTotal;

    private String nombre;

    private byte[] imagen;

    private List<PromocionDto> promociones;

    private List<ComboDto> combos;

    private List<DescuentoDto> descuentos;

    private CategoriaDto categoria;

    private ProveedorDto proveedor;

    private List<LoteDto> lotes;

    private List<CantidadDto> cantidades;

    private Boolean activo;
}

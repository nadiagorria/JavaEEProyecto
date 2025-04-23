package ti.proyectojava.dtos;


import lombok.Data;

@Data
public class CantidadDto {

    private Long id;

    private int cantidad;

    private ProductoDto producto;

    private VentaDto venta;
}

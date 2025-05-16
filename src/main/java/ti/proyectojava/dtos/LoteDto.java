package ti.proyectojava.dtos;

import lombok.Data;

import java.util.Date;

@Data
public class LoteDto {
    private Long id;
    private String numeLote;
    private int stock;
    private Date fechaVencimiento;
    private float precioCompra;
    private Boolean activo;
    private ProductoDto producto;
}

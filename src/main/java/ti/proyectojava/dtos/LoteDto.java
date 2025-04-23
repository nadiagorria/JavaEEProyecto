package ti.proyectojava.dtos;

import lombok.Data;

import java.util.Date;

@Data
public class LoteDto {
    private Long id;
    private String numeLote;
    private int cantidad;
    private Date fechaVencimiento;
    private float precioCompra;
    private Boolean activo;
}

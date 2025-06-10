package ti.proyectojava.dtos;

import lombok.Data;
import ti.proyectojava.business.entities.FormaDePago;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

@Data
public class VentaDto{
    private Long id;
    private LocalDateTime fechaVenta;
    private float total;
    private CreditoDto credito;
    private List<CantidadDto> cantidades;
    private Boolean activo;
    private Boolean finalizada;
    private FormaDePago formaPago;
    private String usuario;
}

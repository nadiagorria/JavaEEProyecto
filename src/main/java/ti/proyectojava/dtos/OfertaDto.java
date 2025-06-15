package ti.proyectojava.dtos;

import lombok.Data;

import java.time.LocalDate;

@Data
public class OfertaDto {

    private Long id;
    private String descripcion;
    private Float descuento;
    private Boolean activo;
    private LocalDate inicio;
    private LocalDate fin;
}

package ti.proyectojava.dtos;

import lombok.Data;

import java.util.Date;

@Data
public class OfertaDto {

    private Long id;
    private String descripcion;
    private Float descuento;
    private Boolean activo;
    private Date inicio;
    private Date fin;
}

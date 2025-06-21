package ti.proyectojava.dtos;

import lombok.Data;


@Data
public class ClienteCreditoDto {

    private String nombre;

    private String telefono;

    private float precioTotal;

    private float pagoHastaAhora;

    private float minimo;

    private float maximo;


}

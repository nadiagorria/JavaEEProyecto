package ti.proyectojava.dtos;

import lombok.Data;

import java.util.List;

@Data
public class ClienteCreditoDto {
    private String nombre;

    private String telefono;

    private float precioTotal;

    private float minimo;

    private float maximo;

    private float pagoHastaAhora;
}

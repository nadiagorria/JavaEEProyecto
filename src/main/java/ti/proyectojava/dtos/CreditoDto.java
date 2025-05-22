package ti.proyectojava.dtos;

import lombok.Data;

import java.util.List;

@Data
public class CreditoDto{

    private Long id;

    private float precioTotal;

    private float minimo;

    private float maximo;

    private float pagoHastaAhora;

    private ClienteDto cliente;

    private List<VentaDto> ventas;
}

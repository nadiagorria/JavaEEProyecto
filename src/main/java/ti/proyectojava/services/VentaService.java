package ti.proyectojava.services;


import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import ti.proyectojava.business.entities.*;
import ti.proyectojava.business.repositories.CantidadRepository;
import ti.proyectojava.business.repositories.CreditoRepository;
import ti.proyectojava.business.repositories.ProductoRepository;
import ti.proyectojava.business.repositories.VentaRepository;
import ti.proyectojava.dtos.CantidadDto;
import ti.proyectojava.dtos.CreditoDto;
import ti.proyectojava.dtos.VentaDto;

import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
public class VentaService {

    private final VentaRepository ventaRepository;
    private final CantidadRepository cantidadRepository;
    private final CreditoRepository creditoRepository;
    private final MapsDtosEntityService mapsDtosEntityService;
    private final ProductoRepository productoRepository;

    @Autowired
    private VentaService(VentaRepository ventaRepository, ProductoRepository productoRepository, CantidadRepository cantidadRepository, CreditoRepository creditoRepository, MapsDtosEntityService mapsDtosEntityService){
        this.ventaRepository=ventaRepository;
        this.cantidadRepository=cantidadRepository;
        this.creditoRepository = creditoRepository;
        this.mapsDtosEntityService = mapsDtosEntityService;
        this.productoRepository = productoRepository;
    }

    public String crearventa(VentaDto ventaDto) {
        if(ventaRepository.findById(ventaDto.getId()).isEmpty()){
            ventaDto.setFinalizada(false);
            return "Venta creada. ID:" + ventaRepository.save(mapsDtosEntityService.mapToEntityVenta(ventaDto)).getId();

        }
        return null;
    }

    public void agregarProductoAVenta(Long ventaId, Long productoId, int cantidadProducto) {
        Venta venta = ventaRepository.findById(ventaId)
                .orElseThrow(() -> new RuntimeException("Venta no encontrada. ID:" + ventaId));

        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado. ID:" + productoId));

        Cantidad cantidad = new Cantidad();
        cantidad.setProducto(producto);
        cantidad.setVenta(venta);
        cantidad.setCantidad(cantidadProducto);

        cantidadRepository.save(cantidad);
        venta.getCantidades().add(cantidad);

        float nuevoTotal = venta.getTotal() + (producto.getPrecioVenta() * cantidadProducto);
        venta.setTotal(nuevoTotal);

        ventaRepository.save(venta);



    }

    public Venta eliminarVenta(Venta venta) {
        venta.setActivo(false);
        ventaRepository.save(venta);
        return venta;
    }

    public String finalizarVenta(Long ventaId) {
        Venta venta = ventaRepository.findById(ventaId)
                .orElseThrow(() -> new RuntimeException("Venta no encontrada. ID:" + ventaId));

        if (venta.getCantidades().isEmpty()) {
            throw new RuntimeException("No se pueden finalizar ventas sin productos. ID:" + ventaId);
        }

        // Calcular el total
        float totalVenta = venta.getCantidades().stream()
                .map(cantidad -> cantidad.getProducto().getPrecioVenta() * cantidad.getCantidad())
                .reduce(0f, Float::sum);

        venta.setTotal(totalVenta);

        // si está asociada a un crédito
        if (venta.getCredito() != null) {
            Credito credito = venta.getCredito();
            float nuevoPrecioTotal = credito.getPrecioTotal() + totalVenta;
            credito.setPrecioTotal(nuevoPrecioTotal);
            creditoRepository.save(credito);
        }

        venta.setFinalizada(true); // Marcar la venta como finalizada
        ventaRepository.save(venta);

        return "Venta finalizada correctamente. ID:" + venta.getId();
    }

}

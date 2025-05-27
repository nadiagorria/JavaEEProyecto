package ti.proyectojava.services;


import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import ti.proyectojava.api.responses.ResponseListadoVentas;
import ti.proyectojava.business.entities.*;
import ti.proyectojava.business.repositories.CantidadRepository;
import ti.proyectojava.business.repositories.CreditoRepository;
import ti.proyectojava.business.repositories.ProductoRepository;
import ti.proyectojava.business.repositories.VentaRepository;
import ti.proyectojava.dtos.CantidadDto;
import ti.proyectojava.dtos.CreditoDto;
import ti.proyectojava.dtos.VentaDto;

import java.util.List;
import java.util.NoSuchElementException;
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



    public VentaDto obtenerVentaPorId(Long ventaId) {
        Venta venta = ventaRepository.findById(ventaId).orElseThrow(() -> new RuntimeException("Venta no existe"));
        return mapsDtosEntityService.mapToDtoVentaPlano(venta);
    }    public Long crearVenta(VentaDto ventaDto) {
        ventaDto.setFinalizada(true);
        Venta ventaGuardada = ventaRepository.save(mapsDtosEntityService.mapToEntityVenta(ventaDto));
        
        if (ventaGuardada.getFormaPago() == FormaDePago.FIADO && ventaGuardada.getCredito() != null) {
            Credito credito = ventaGuardada.getCredito();
            float nuevoPrecioTotal = credito.getPrecioTotal() + ventaGuardada.getTotal();
            credito.setPrecioTotal(nuevoPrecioTotal);
            creditoRepository.save(credito);
        }
        
        return ventaGuardada.getId();
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

    public Venta eliminarVenta(Long ventaId) {
        Venta venta = ventaRepository.findById(ventaId)
                .orElseThrow(() -> new RuntimeException("Venta no encontrada. ID: " + ventaId));
        venta.setActivo(false);
        venta.setFinalizada(true);
        return ventaRepository.save(venta);
    }

    public String eliminarCantidadDeVenta(Long ventaId, Long cantidadId) {
        Venta venta = ventaRepository.findById(ventaId)
                .orElseThrow(() -> new RuntimeException("Venta no encontrada. ID:" + ventaId));

        if (venta.getFinalizada()) {
            throw new RuntimeException("No se puede modificar una venta finalizada. ID:" + ventaId);
        }

        Cantidad cantidad = cantidadRepository.findById(cantidadId)
                .orElseThrow(() -> new RuntimeException("Cantidad no encontrada. ID:" + cantidadId));

        if (!cantidad.getVenta().getId().equals(ventaId)) {
            throw new RuntimeException("La cantidad no pertenece a la venta especificada.");
        }


        float montoRestado = cantidad.getProducto().getPrecioVenta() * cantidad.getCantidad();
        venta.setTotal(venta.getTotal() - montoRestado);


        venta.getCantidades().remove(cantidad);
        cantidadRepository.delete(cantidad);

        ventaRepository.save(venta);

        return "Producto eliminado de la venta correctamente. ID Venta: " + ventaId;
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

    public ResponseListadoVentas listadoVentas() {
        ResponseListadoVentas responseListadoVentas = new ResponseListadoVentas();

        List<VentaDto> ventasActivas = ventaRepository.findByActivoTrue()
                .stream()
                .map(mapsDtosEntityService::mapToDtoVenta)
                .toList();

        responseListadoVentas.setVentas(ventasActivas);

        return responseListadoVentas;
    }
}

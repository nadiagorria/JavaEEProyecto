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
        
        // Verificar si la venta está activa
        if (!venta.getActivo()) {
            throw new RuntimeException("La venta ha sido eliminada y no está disponible");
        }
        
        return mapsDtosEntityService.mapToDtoVentaPlano(venta);
    }public Long crearVenta(VentaDto ventaDto) {
        ventaDto.setFinalizada(true);
        Venta ventaGuardada = ventaRepository.save(mapsDtosEntityService.mapToEntityVenta(ventaDto));
        
        // Descontar stock de los productos vendidos
        for (Cantidad cantidad : ventaGuardada.getCantidades()) {
            Producto producto = cantidad.getProducto();
            int stockActual = producto.getStockTotal();
            int cantidadVendida = cantidad.getCantidad();
            
            // Verificar que hay suficiente stock
            if (stockActual < cantidadVendida) {
                throw new RuntimeException("Stock insuficiente para el producto: " + producto.getNombre() + 
                    ". Stock disponible: " + stockActual + ", Cantidad solicitada: " + cantidadVendida);
            }
            
            // Descontar el stock del producto
            producto.setStockTotal(stockActual - cantidadVendida);
            productoRepository.save(producto);
            
            log.info("Stock actualizado para producto {}: {} -> {}", 
                producto.getNombre(), stockActual, producto.getStockTotal());
        }
        
        if (ventaGuardada.getFormaPago() == FormaDePago.FIADO && ventaGuardada.getCredito() != null) {
            Credito credito = ventaGuardada.getCredito();
            float nuevoPrecioTotal = credito.getPrecioTotal() + ventaGuardada.getTotal();
            credito.setPrecioTotal(nuevoPrecioTotal);
            creditoRepository.save(credito);
        }
        
        return ventaGuardada.getId();
    }

        public Venta eliminarVenta(Long ventaId) {
        Venta venta = ventaRepository.findById(ventaId)
                .orElseThrow(() -> new RuntimeException("Venta no encontrada. ID: " + ventaId));
        
        // Verificar que la venta esté activa antes de eliminarla
        if (!venta.getActivo()) {
            throw new RuntimeException("La venta ya está eliminada. ID: " + ventaId);
        }
        
        // Devolver el stock de los productos vendidos
        for (Cantidad cantidad : venta.getCantidades()) {
            Producto producto = cantidad.getProducto();
            int stockActual = producto.getStockTotal();
            int cantidadDevolver = cantidad.getCantidad();
            
            // Incrementar el stock total del producto
            producto.setStockTotal(stockActual + cantidadDevolver);
            productoRepository.save(producto);
            
            log.info("Stock devuelto para producto ID {}: {} unidades. Nuevo stock: {}", 
                     producto.getId(), cantidadDevolver, producto.getStockTotal());
        }
        
        // Si la venta era a crédito, reducir el monto del crédito
        if (venta.getCredito() != null) {
            Credito credito = venta.getCredito();
            float nuevoPrecioTotal = credito.getPrecioTotal() - venta.getTotal();
            credito.setPrecioTotal(Math.max(0, nuevoPrecioTotal)); // Evitar valores negativos
            creditoRepository.save(credito);
            
            log.info("Crédito actualizado para cliente ID {}: reducido en {}. Nuevo total: {}", 
                     credito.getId(), venta.getTotal(), credito.getPrecioTotal());
        }
        
        venta.setActivo(false);
        venta.setFinalizada(true);
        
        log.info("Venta eliminada exitosamente. ID: {}. Stock devuelto para {} productos.", 
                 ventaId, venta.getCantidades().size());
        
        return ventaRepository.save(venta);
    }    public String eliminarCantidadDeVenta(Long ventaId, Long cantidadId) {
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

        // Devolver el stock del producto
        Producto producto = cantidad.getProducto();
        int stockActual = producto.getStockTotal();
        int cantidadDevolver = cantidad.getCantidad();
        
        producto.setStockTotal(stockActual + cantidadDevolver);
        productoRepository.save(producto);
        
        log.info("Stock devuelto para producto {}: {} unidades. Nuevo stock: {}", 
                 producto.getNombre(), cantidadDevolver, producto.getStockTotal());

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
    }    public ResponseListadoVentas listadoVentas() {
        ResponseListadoVentas responseListadoVentas = new ResponseListadoVentas();

        // Obtener solo las ventas activas
        List<VentaDto> ventasActivas = ventaRepository.findByActivoTrue()
                .stream()
                .map(mapsDtosEntityService::mapToDtoVentaPlano)
                .toList();

        responseListadoVentas.setVentas(ventasActivas);

        return responseListadoVentas;
    }

    public Integer listadoVentasTotales() {
        return ventaRepository.cantidadVentas();
    }
}

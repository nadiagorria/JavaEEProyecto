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
import ti.proyectojava.dtos.VentaDto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class VentaService {

    private final VentaRepository ventaRepository;
    private final CantidadRepository cantidadRepository;
    private final CreditoRepository creditoRepository;
    private final MapsDtosEntityService mapsDtosEntityService;
    private final ProductoRepository productoRepository;
    private final NotificacionUsuarioService notificacionUsuarioService;

    @Autowired
    private VentaService(VentaRepository ventaRepository, ProductoRepository productoRepository, CantidadRepository cantidadRepository, CreditoRepository creditoRepository, MapsDtosEntityService mapsDtosEntityService, @Lazy NotificacionUsuarioService notificacionUsuarioService){
        this.ventaRepository=ventaRepository;
        this.cantidadRepository=cantidadRepository;
        this.creditoRepository = creditoRepository;
        this.mapsDtosEntityService = mapsDtosEntityService;
        this.productoRepository = productoRepository;
        this.notificacionUsuarioService = notificacionUsuarioService;
    }

    public VentaDto obtenerVentaPorId(Long ventaId) {
        Venta venta = ventaRepository.findById(ventaId).orElseThrow(() -> new RuntimeException("Venta no existe"));
        
        if (!venta.getActivo()) {
            throw new RuntimeException("La venta ha sido eliminada y no está disponible");
        }
        
        return mapsDtosEntityService.mapToDtoVentaPlano(venta);    
    }
    
    public Long crearVenta(VentaDto ventaDto) {
        System.out.println("VentaService - estableciendo fecha y hora actual para la venta");
        
        LocalDateTime ahora = LocalDateTime.now();
        ventaDto.setFechaVenta(ahora);
        System.out.println("VentaService - fechaVenta asignada: " + ventaDto.getFechaVenta());
        
        Venta ventaGuardada = ventaRepository.save(mapsDtosEntityService.mapToEntityVenta(ventaDto));

        List<Cantidad> cantidades = new ArrayList<>(ventaGuardada.getCantidades());
        for (Cantidad cantidad : cantidades) {
            Producto producto = cantidad.getProducto();
            int stockActual = producto.getStockTotal();
            int cantidadVendida = cantidad.getCantidad();
            
            if (stockActual < cantidadVendida) {
                throw new RuntimeException("Stock insuficiente para el producto: " + producto.getNombre() + 
                    ". Stock disponible: " + stockActual + ", Cantidad solicitada: " + cantidadVendida);
            }
            
            producto.setStockTotal(stockActual - cantidadVendida);
            productoRepository.save(producto);
            
            log.info("Stock actualizado para producto {}: {} -> {}", 
                producto.getNombre(), stockActual, producto.getStockTotal());
            
            try {
                notificacionUsuarioService.verificarStockMinimoPostVenta(producto);
            } catch (Exception e) {
                log.warn("Error al verificar stock mínimo para producto {}: {}", producto.getNombre(), e.getMessage());
            }
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
        
        if (!venta.getActivo()) {
            throw new RuntimeException("La venta ya está eliminada. ID: " + ventaId);
        }

        List<Cantidad> cantidades = new ArrayList<>(venta.getCantidades());
        for (Cantidad cantidad : cantidades) {
            Producto producto = cantidad.getProducto();
            int stockActual = producto.getStockTotal();
            int cantidadDevolver = cantidad.getCantidad();
            
            producto.setStockTotal(stockActual + cantidadDevolver);
            productoRepository.save(producto);
            
            log.info("Stock devuelto para producto ID {}: {} unidades. Nuevo stock: {}", 
                     producto.getId(), cantidadDevolver, producto.getStockTotal());
        }
        
        if (venta.getCredito() != null) {
            Credito credito = venta.getCredito();
            float nuevoPrecioTotal = credito.getPrecioTotal() - venta.getTotal();
            credito.setPrecioTotal(Math.max(0, nuevoPrecioTotal));
            creditoRepository.save(credito);
            
            log.info("Crédito actualizado para cliente ID {}: reducido en {}. Nuevo total: {}", 
                     credito.getId(), venta.getTotal(), credito.getPrecioTotal());
        }
        
        venta.setActivo(false);
        
        log.info("Venta eliminada exitosamente. ID: {}. Stock devuelto para {} productos.", 
                 ventaId, venta.getCantidades().size());
        
        return ventaRepository.save(venta);
    }


    public ResponseListadoVentas listadoVentas() {
        ResponseListadoVentas responseListadoVentas = new ResponseListadoVentas();

        List<VentaDto> ventasActivas = ventaRepository.findByActivoTrue()
                .stream()
                .map(mapsDtosEntityService::mapToDtoVentaPlano)
                .toList();

        responseListadoVentas.setVentas(ventasActivas);

        return responseListadoVentas;
    }

    public ResponseListadoVentas listadoVentasPorUsuario(String nombreUsuario) {
        ResponseListadoVentas responseListadoVentas = new ResponseListadoVentas();

        List<VentaDto> ventasUsuario = ventaRepository.findByActivoTrueAndUsuarioNombre(nombreUsuario)
                .stream()
                .map(mapsDtosEntityService::mapToDtoVentaPlano)
                .toList();

        responseListadoVentas.setVentas(ventasUsuario);

        return responseListadoVentas;
    }

    public Integer listadoVentasTotales() {
        return ventaRepository.cantidadVentas();
    }
}

package ti.proyectojava.services;


import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import ti.proyectojava.business.entities.*;
import ti.proyectojava.business.repositories.CantidadRepository;
import ti.proyectojava.business.repositories.ProductoRepository;
import ti.proyectojava.business.repositories.VentaRepository;
import ti.proyectojava.dtos.CantidadDto;
import ti.proyectojava.dtos.CreditoDto;
import ti.proyectojava.dtos.VentaDto;

import java.util.stream.Collectors;

@Service
@Slf4j
public class VentaService {

    private final VentaRepository ventaRepository;
    private final ProductoRepository productoRepository;
    private final CantidadRepository cantidadRepository;
    private final ProductoService productoService;
    private final EntidadService entidadService;

    @Autowired
    private VentaService(VentaRepository ventaRepository, ProductoRepository productoRepository, CantidadRepository cantidadRepository, @Lazy ProductoService productoService, EntidadService entidadService){
        this.ventaRepository=ventaRepository;
        this.productoRepository=productoRepository;
        this.cantidadRepository=cantidadRepository;
        this.productoService = productoService;
        this.entidadService = entidadService;
    }

    public String crearventa(VentaDto ventaDto) {
        if(ventaRepository.findById(ventaDto.getId()).isEmpty()){
            return "Venta creada id: " + ventaRepository.save(mapToEntityVenta(ventaDto)).getId();
        }

        return null;
    }

    public void agregarProductoAVenta(Long ventaId, Long productoId, int cantidadProducto) {
        Venta venta = ventaRepository.findById(ventaId)
                .orElseThrow(() -> new RuntimeException("Venta no encontrada"));

        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        Cantidad cantidad = new Cantidad();
        cantidad.setProducto(producto);
        cantidad.setVenta(venta);
        cantidad.setCantidad(cantidadProducto);

        cantidadRepository.save(cantidad);
        venta.getCantidades().add(cantidad);
        ventaRepository.save(venta);

    }

        public Venta eliminarVenta(Venta venta) {
        venta.setActivo(false);
        ventaRepository.save(venta);
        return venta;
    }

    public CantidadDto mapToDtoCantidad(Cantidad cantidad) {
        CantidadDto dto = new CantidadDto();

        dto.setId(cantidad.getId());
        dto.setCantidad(cantidad.getCantidad());
        dto.setProducto(productoService.mapToDtoProducto(cantidad.getProducto()));
        dto.setVenta(mapToDtoVenta(cantidad.getVenta()));

        return dto;
    }

    public Cantidad mapToEntityCantidad(CantidadDto dto) {
        Cantidad cantidad = new Cantidad();

        cantidad.setId(dto.getId());
        cantidad.setCantidad(dto.getCantidad());
        cantidad.setProducto(productoService.mapToEntityProducto(dto.getProducto()));
        cantidad.setVenta(mapToEntityVenta(dto.getVenta()));

        return cantidad;
    }

    public VentaDto mapToDtoVenta(Venta venta) {
        VentaDto dto = new VentaDto();

        dto.setId(venta.getId());
        dto.setFechaVenta(venta.getFechaVenta());
        dto.setTotal(venta.getTotal());
        dto.setActivo(venta.getActivo());
        dto.setCredito(mapToDtoCredito(venta.getCredito()));
        dto.setCantidades(venta.getCantidades().stream()
                .map(e -> mapToDtoCantidad(e))
                .collect(Collectors.toList()));

        return dto;
    }

    public Venta mapToEntityVenta(VentaDto dto) {
        Venta venta = new Venta();

        venta.setId(dto.getId());
        venta.setFechaVenta(dto.getFechaVenta());
        venta.setTotal(dto.getTotal());
        venta.setActivo(dto.getActivo());

        venta.setCredito(mapToEntityCredito(dto.getCredito()));
        venta.setCantidades(dto.getCantidades().stream()
                .map(c -> mapToEntityCantidad(c))
                .collect(Collectors.toList()));

        return venta;
    }

    public CreditoDto mapToDtoCredito(Credito credito) {
        CreditoDto dto = new CreditoDto();

        dto.setId(credito.getId());
        dto.setPrecioTotal(credito.getPrecioTotal());
        dto.setMinimo(credito.getMinimo());
        dto.setMaximo(credito.getMaximo());
        dto.setPagoHastaAhora(credito.getPagoHastaAhora());
        dto.setCliente(entidadService.mapToDtoCliente(credito.getCliente()));
        return dto;
    }

    public Credito mapToEntityCredito(CreditoDto dto) {
        Credito credito = new Credito();

        credito.setId(dto.getId());
        credito.setPrecioTotal(dto.getPrecioTotal());
        credito.setMinimo(dto.getMinimo());
        credito.setMaximo(dto.getMaximo());
        credito.setPagoHastaAhora(dto.getPagoHastaAhora());
        credito.setCliente(entidadService.mapToEntityCliente(dto.getCliente()));
        return credito;
    }


}

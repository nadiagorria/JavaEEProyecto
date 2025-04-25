package ti.proyectojava.services;


import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import ti.proyectojava.api.responses.ResponseListadoCategorias;
import ti.proyectojava.api.responses.ResponseListadoProductos;
import ti.proyectojava.business.entities.*;
import ti.proyectojava.business.repositories.ProductoRepository;
import ti.proyectojava.dtos.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final EntidadService entidadService;
    private  final CategoriaService categoriaService;
    private final LoteService loteService;

    public ProductoService(ProductoRepository productoRepository, EntidadService entidadService, CategoriaService categoriaService, LoteService loteService) {
        this.productoRepository = productoRepository;
        this.entidadService = entidadService;
        this.categoriaService = categoriaService;
        this.loteService = loteService;
    }

    public ResponseListadoProductos listadoProductos() {
        ResponseListadoProductos response = new ResponseListadoProductos();

        List<ProductoDto> productosActivos = productoRepository.findByActivoTrue()
                .stream()
                .map(this::mapToDtoProducto)
                .toList();

        response.setProductos(productosActivos);

        return response;
    }
    public String crearProducto(ProductoDto productoDto) {
        if(productoRepository.findById(productoDto.getId()).isEmpty()){
            return "Producto creado nro: " + productoRepository.save(mapToEntityProducto(productoDto)).getId();
        }

        return null;
    }

    public Producto buscaProducto(Long id) {
        Optional<Producto> aux = productoRepository.findById(id);
        if(aux.isPresent()){
            return aux.get();
        }
        return null;

    }

    public Producto editarProducto(Producto productoActual, ProductoDto productoDto) {
        productoActual.setId(productoDto.getId());
        productoActual.setPrecioCompra(productoDto.getPrecioCompra());
        productoActual.setPrecioVenta(productoDto.getPrecioVenta());
        productoActual.setCodigoDeBarra(productoDto.getCodigoDeBarra());
        productoActual.setStockMin(productoDto.getStockMin());
        productoActual.setStockTotal(productoDto.getStockTotal());
        productoActual.setActivo(productoDto.getActivo());
        productoActual.setCombos(mapToEntityProducto(productoDto).getCombos());
        productoActual.setNombre(productoDto.getNombre());
        productoActual.setProveedor(mapToEntityProducto(productoDto).getProveedor());
        productoActual.setLotes(mapToEntityProducto(productoDto).getLotes());
        productoActual.setPromociones(mapToEntityProducto(productoDto).getPromociones());
        productoActual.setImagen(productoDto.getImagen());
        productoActual.setDescuentos(mapToEntityProducto(productoDto).getDescuentos());
        productoActual.setCategoria(mapToEntityProducto(productoDto).getCategoria());
        productoActual.setProveedor(mapToEntityProducto(productoDto).getProveedor());
        productoActual.setCantidades(mapToEntityProducto(productoDto).getCantidades());

        productoRepository.save(productoActual);
        return productoActual;
    }

    public String borrarProducto(Long id) {
        Optional<Producto> productoAct = productoRepository.findById(id);
        String response = null;

        if (productoAct.isPresent()) {
            Producto producto = productoAct.get();
            producto.setActivo(false);
            productoRepository.save(producto);
            response = "Producto eliminado correctamente. ID: " + producto.getId();
        }
        return response;
    }

    public Producto mapToEntityProducto (ProductoDto productoDto) {
        Producto producto = new Producto();
        producto.setId(productoDto.getId());
        producto.setPrecioCompra(productoDto.getPrecioCompra());
        producto.setPrecioVenta(productoDto.getPrecioVenta());
        producto.setCodigoDeBarra(productoDto.getCodigoDeBarra());
        producto.setStockMin(productoDto.getStockMin());
        producto.setStockTotal(productoDto.getStockTotal());
        producto.setActivo(productoDto.getActivo());
        producto.setNombre(productoDto.getNombre());
        producto.setImagen(productoDto.getImagen());

        if (productoDto.getCombos() != null) {
            producto.setCombos(
                    productoDto.getCombos().stream()
                            .map(e -> mapToEntityCombo(e))
                            .toList()
            );
        }

        if (productoDto.getProveedor() != null) {
            producto.setProveedor(entidadService.mapToEntityProveedor(productoDto.getProveedor()));
        }

        if (productoDto.getLotes() != null) {
            producto.setLotes(
                    productoDto.getLotes().stream()
                            .map(e -> loteService.mapToEntityLote(e))
                            .toList()
            );
        }

        if (productoDto.getPromociones() != null) {
            producto.setPromociones(
                    productoDto.getPromociones().stream()
                            .map(e -> mapToEntityPromocion(e))
                            .toList()
            );
        }

        if (productoDto.getDescuentos() != null) {
            producto.setDescuentos(
                    productoDto.getDescuentos().stream()
                            .map(e -> mapToEntityDescuento(e))
                            .toList()
            );
        }

        if (productoDto.getProveedor() != null) {
            producto.setCategoria(categoriaService.mapToEntityCategoria(productoDto.getCategoria()));
        }

        if (productoDto.getCantidades() != null) {
            producto.setCantidades(
                    productoDto.getCantidades().stream()
                            .map(e -> mapToEntityCantidad(e))
                            .toList()
            );
        }

        return producto;
    }

    public ProductoDto mapToDtoProducto (Producto producto){
        ProductoDto productoDto = new ProductoDto();
        productoDto.setId(producto.getId());
        productoDto.setPrecioCompra(producto.getPrecioCompra());
        productoDto.setPrecioVenta(producto.getPrecioVenta());
        productoDto.setCodigoDeBarra(producto.getCodigoDeBarra());
        productoDto.setStockMin(producto.getStockMin());
        productoDto.setStockTotal(producto.getStockTotal());
        productoDto.setActivo(producto.getActivo());
        productoDto.setNombre(producto.getNombre());
        productoDto.setImagen(producto.getImagen());

        if (producto.getCombos() != null) {
            productoDto.setCombos(
                    producto.getCombos().stream()
                            .map(e -> mapToDtoCombo(e))
                            .toList()
            );
        }

        if (producto.getProveedor() != null) {
            productoDto.setProveedor(entidadService.mapToDtoProveedor(producto.getProveedor()));
        }

        if (producto.getLotes() != null) {
            productoDto.setLotes(
                    producto.getLotes().stream()
                            .map(e -> loteService.mapToDtoLote(e))
                            .toList()
            );
        }

        if (producto.getPromociones() != null) {
            productoDto.setPromociones(
                    producto.getPromociones().stream()
                            .map(e -> mapToDtoPromocion(e))
                            .toList()
            );
        }

        if (producto.getDescuentos() != null) {
            productoDto.setDescuentos(
                    producto.getDescuentos().stream()
                            .map(e -> mapToDtoDescuento(e))
                            .toList()
            );
        }

        if (producto.getProveedor() != null) {
            productoDto.setCategoria(categoriaService.mapToDtoCategoria(producto.getCategoria()));
        }

        if (producto.getCantidades() != null) {
            productoDto.setCantidades(
                    producto.getCantidades().stream()
                            .map(e -> mapToDtoCantidad(e))
                            .toList()
            );
        }

        return productoDto;

    }

    public ComboDto mapToDtoCombo(Combo combo) {
        ComboDto comboDto = new ComboDto();

        comboDto.setId(combo.getId());
        comboDto.setDescuento(combo.getDescuento());
        comboDto.setActivo(combo.getActivo());
        comboDto.setDescripcion(combo.getDescripcion());
        comboDto.setProductos(
                combo.getProductos()
                        .stream()
                        .map(p -> mapToDtoProducto(p))
                        .toList()
        );

        return comboDto;
    }

    public Combo mapToEntityCombo(ComboDto comboDto) {
        Combo combo = new Combo();

        combo.setId(comboDto.getId());
        combo.setDescuento(comboDto.getDescuento());
        combo.setActivo(comboDto.getActivo());
        combo.setDescripcion(comboDto.getDescripcion());
        combo.setProductos(
                comboDto.getProductos()
                        .stream()
                        .map(p -> mapToEntityProducto(p))
                        .toList()
        );

        return combo;
    }

    public PromocionDto mapToDtoPromocion(Promocion promocion) {
        PromocionDto dto = new PromocionDto();

        dto.setId(promocion.getId());
        dto.setDescuento(promocion.getDescuento());
        dto.setActivo(promocion.getActivo());
        dto.setDescripcion(promocion.getDescripcion());
        dto.setProducto(mapToDtoProducto(promocion.getProducto()));

        return dto;
    }

    public Promocion mapToEntityPromocion(PromocionDto dto) {
        Promocion promocion = new Promocion();

        promocion.setId(dto.getId());
        promocion.setDescuento(dto.getDescuento());
        promocion.setActivo(dto.getActivo());
        promocion.setDescripcion(dto.getDescripcion());
        promocion.setProducto(mapToEntityProducto(dto.getProducto()));

        return promocion;
    }

    public DescuentoDto mapToDtoDescuento(Descuento descuento) {
        DescuentoDto dto = new DescuentoDto();

        dto.setId(descuento.getId());
        dto.setDescuento(descuento.getDescuento());
        dto.setActivo(descuento.getActivo());
        dto.setProducto(mapToDtoProducto(descuento.getProducto()));
        return dto;
    }

    public Descuento mapToEntityDescuento(DescuentoDto dto) {
        Descuento descuento = new Descuento();

        descuento.setId(dto.getId());
        descuento.setDescuento(dto.getDescuento());
        descuento.setActivo(dto.getActivo());
        descuento.setProducto(mapToEntityProducto(dto.getProducto()));
        return descuento;
    }

    public CantidadDto mapToDtoCantidad(Cantidad cantidad) {
        CantidadDto dto = new CantidadDto();

        dto.setId(cantidad.getId());
        dto.setCantidad(cantidad.getCantidad());
        dto.setProducto(mapToDtoProducto(cantidad.getProducto()));
        dto.setVenta(mapToDtoVenta(cantidad.getVenta()));

        return dto;
    }

    public Cantidad mapToEntityCantidad(CantidadDto dto) {
        Cantidad cantidad = new Cantidad();

        cantidad.setId(dto.getId());
        cantidad.setCantidad(dto.getCantidad());
        cantidad.setProducto(mapToEntityProducto(dto.getProducto()));
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




package ti.proyectojava.services;


import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import ti.proyectojava.api.responses.ResponseListadoProductos;
import ti.proyectojava.business.entities.*;
import ti.proyectojava.business.repositories.CantidadRepository;
import ti.proyectojava.business.repositories.ProductoRepository;
import ti.proyectojava.dtos.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final CantidadRepository cantidadRepository;
    private final MapsDtosEntityService mapsDtosEntityService;

    public ProductoService(ProductoRepository productoRepository, CantidadRepository cantidadRepository, MapsDtosEntityService mapsDtosEntityService) {
        this.productoRepository = productoRepository;
        this.cantidadRepository = cantidadRepository;
        this.mapsDtosEntityService = mapsDtosEntityService;
    }

    public void ActualizarPrecioCompraYStockProducto(Long id, float nuevoPrecioCompra, int nuevoStock) {
        Optional<Producto> productoOptional = productoRepository.findById(id);
        if (productoOptional.isPresent()) {
            Producto producto = productoOptional.get();
            producto.setPrecioCompra(nuevoPrecioCompra);
            int nuevoTotal = producto.getStockTotal() + nuevoStock;
            producto.setStockTotal(nuevoTotal);
            productoRepository.save(producto);
        } else {
            throw new RuntimeException("Producto no encontrado. ID:" + id);
        }
    }

    public ResponseListadoProductos listadoProductos() {
        ResponseListadoProductos response = new ResponseListadoProductos();

        List<ProductoDto> productosActivos = productoRepository.findByActivoTrue().stream().map(mapsDtosEntityService::mapToDtoProducto).toList();

        response.setProductos(productosActivos);

        return response;
    }

    public ResponseListadoProductos listadoProductosTop(int n) {
        ResponseListadoProductos response = new ResponseListadoProductos();

        List<Object[]> topResults = cantidadRepository.findTopBestSellingProducts();
        List<ProductoDto> topMasVendidos = topResults.stream().limit(n).map(result -> {
            Producto producto = (Producto) result[0];
            return mapsDtosEntityService.mapToDtoProductoSimple(producto);
        }).collect(Collectors.toList());

        response.setProductos(topMasVendidos);

        return response;
    }

    public String crearProducto(ProductoDto productoDto) {
        return "Producto creado. ID:" + productoRepository.save(mapsDtosEntityService.mapToEntityProducto(productoDto)).getId();
    }

    public byte[] obtenerImagenProducto(Long id) {
        Optional<Producto> producto = productoRepository.findById(id);
        if (producto.isPresent() && producto.get().getImagen() != null) {
            return producto.get().getImagen();
        }
        return null;
    }

    public String actualizarImagenProducto(Long id, byte[] imagen) {
        Optional<Producto> optionalProducto = productoRepository.findById(id);
        if (optionalProducto.isPresent()) {
            Producto producto = optionalProducto.get();
            producto.setImagen(imagen);
            productoRepository.save(producto);
            return "Imagen del producto actualizada. ID:" + id;
        }
        throw new RuntimeException("Producto no encontrado. ID:" + id);
    }

    public ProductoDto buscaProducto(Long id) {
        Optional<Producto> aux = productoRepository.findById(id);
        if (aux.isPresent()) {
            return mapsDtosEntityService.mapToDtoProducto(aux.get());
        }
        return null;
    }

    public Producto editarProductoPorId(Long id, ProductoDto productoDto) {
        Optional<Producto> productoOpt = productoRepository.findById(id);

        if (productoOpt.isPresent()) {
            Producto productoActual = productoOpt.get();

            if (productoDto.getNombre() != null) {
                productoActual.setNombre(productoDto.getNombre());
            }
            if (productoDto.getPrecioVenta() != 0) {
                productoActual.setPrecioVenta(productoDto.getPrecioVenta());
            }

            productoActual.setStockMin(productoDto.getStockMin());

            if (productoDto.getCodigoDeBarra() != null) {
                productoActual.setCodigoDeBarra(productoDto.getCodigoDeBarra());
            }

            if (productoDto.getCategoria() != null) {
                productoActual.setCategoria(mapsDtosEntityService.mapToEntityCategoria(productoDto.getCategoria()));
            }

            if (productoDto.getProveedor() != null) {
                productoActual.setProveedor(mapsDtosEntityService.mapToEntityProveedor(productoDto.getProveedor()));
            }

            productoRepository.save(productoActual);
            return productoActual;
        }
        return null;
    }

    public String borrarProducto(Long id) {
        Optional<Producto> productoAct = productoRepository.findById(id);
        String response = null;

        if (productoAct.isPresent()) {
            Producto producto = productoAct.get();
            producto.setActivo(false);
            productoRepository.save(producto);
            response = "Producto eliminado correctamente. ID:" + producto.getId();
        }
        return response;
    }

    public List<ProductoDto> buscarTodosPorCodigoBarras(String codigoBarras) {
        List<Producto> productos = productoRepository.findAllByCodigoDeBarraAndActivoTrue(codigoBarras);
        return productos.stream().map(mapsDtosEntityService::mapToDtoProducto).collect(Collectors.toList());
    }

    public void modificarStockTotal(Long productoId, Integer nuevoStockTotal) {


        Optional<Producto> productoOptional = productoRepository.findById(productoId);
        if (productoOptional.isEmpty()) {
            throw new RuntimeException("Producto no encontrado. ID: " + productoId);
        }

        if (nuevoStockTotal < 0) {
            throw new RuntimeException("El stock total no puede ser negativo");
        }

        Producto producto = productoOptional.get();
        if (!producto.getActivo()) {
            throw new RuntimeException("No se puede modificar el stock de un producto inactivo");
        }

        int stockAnterior = producto.getStockTotal();
        producto.setStockTotal(nuevoStockTotal);


        if (producto.getStockTotal() > nuevoStockTotal) {
            producto.setStockTotal(nuevoStockTotal);
        }

        productoRepository.save(producto);

        log.info("Stock modificado para producto '{}' (ID: {}). Stock anterior: {}, Stock nuevo: {}", producto.getNombre(), productoId, stockAnterior, nuevoStockTotal);
    }

    public Page<ProductoDto> listadoProductosPage(Integer pagina, Integer cantidad) {
        PageRequest pageRequest = PageRequest.of(pagina, cantidad);
        Sort sort = Sort.by(Sort.Direction.ASC, "nombre");
        return productoRepository.findByActivoTrue(pageRequest.withSort(sort)).map(mapsDtosEntityService::mapToDtoProducto);
    }

    public Page<ProductoDto> listadoProductosPageConFiltros(Integer pagina, Integer cantidad, String busqueda, Long categoriaId) {
        PageRequest pageRequest = PageRequest.of(pagina, cantidad);
        Sort sort = Sort.by(Sort.Direction.ASC, "nombre");
        return productoRepository.findByActivoTrueWithFilters(busqueda, categoriaId, pageRequest.withSort(sort))
                .map(mapsDtosEntityService::mapToDtoProducto);
    }

}




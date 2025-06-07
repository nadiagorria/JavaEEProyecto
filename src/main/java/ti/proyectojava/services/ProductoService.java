package ti.proyectojava.services;


import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import ti.proyectojava.api.responses.ResponseListadoCategorias;
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

        List<ProductoDto> productosActivos = productoRepository.findByActivoTrue()
                .stream()
                .map(mapsDtosEntityService::mapToDtoProducto)
                .toList();

        response.setProductos(productosActivos);

        return response;
    }   
      public ResponseListadoProductos listadoProductosCategorias(int n) {
        ResponseListadoProductos response = new ResponseListadoProductos();

        // Obtener los top n productos más vendidos con sus categorías
        List<Object[]> topResults = cantidadRepository.findTopBestSellingProducts();
        List<ProductoDto> topMasVendidos = topResults.stream()
                .limit(n)
                .map(result -> {
                    Producto producto = (Producto) result[0];
                    return mapsDtosEntityService.mapToDtoProductoCategoria(producto);
                })
                .collect(Collectors.toList());

        response.setProductos(topMasVendidos);

        return response;
    }    public String crearProducto(ProductoDto productoDto) {
        return "Producto creado. ID:" + productoRepository.save(mapsDtosEntityService.mapToEntityProducto(productoDto)).getId();
    }

    public String crearProductoConImagen(ProductoDto productoDto, Long categoriaId, Long proveedorId) {
        Producto producto = mapsDtosEntityService.mapToEntityProducto(productoDto);
        
        // Asignar categoría y proveedor si se proporcionan
        if (categoriaId != null) {
            // Aquí deberías inyectar el repositorio de categorías para buscar por ID
            // Por simplicidad, se asume que la categoría ya está en el DTO
        }
        
        if (proveedorId != null) {
            // Aquí deberías inyectar el repositorio de proveedores para buscar por ID
            // Por simplicidad, se asume que el proveedor ya está en el DTO
        }
        
        return "Producto creado con imagen. ID:" + productoRepository.save(producto).getId();
    }

    public byte[] obtenerImagenProducto(Long id) {
        Optional<Producto> producto = productoRepository.findById(id);
        if (producto.isPresent() && producto.get().getImagen() != null) {
            return producto.get().getImagen();
        }
        return null;
    }    public String actualizarImagenProducto(Long id, byte[] imagen) {
        Optional<Producto> optionalProducto = productoRepository.findById(id);
        if (optionalProducto.isPresent()) {
            Producto producto = optionalProducto.get();
            producto.setImagen(imagen);
            productoRepository.save(producto);
            return "Imagen del producto actualizada. ID:" + id;        }
        throw new RuntimeException("Producto no encontrado. ID:" + id);
    }

    public ProductoDto buscaProducto(Long id) {
        Optional<Producto> aux = productoRepository.findById(id);
        if(aux.isPresent()){
            // Usar el método que NO incluye la imagen para evitar error 431 "Request Header Fields Too Large"
            // La imagen se obtiene por separado usando el endpoint /producto/{id}/imagen
            return mapsDtosEntityService.mapToDtoProducto(aux.get());
        }
        return null;
    }    public Producto editarProducto(Producto productoActual, ProductoDto productoDto) {

        productoActual.setPrecioCompra(productoDto.getPrecioCompra());
        productoActual.setPrecioVenta(productoDto.getPrecioVenta());
        productoActual.setCodigoDeBarra(productoDto.getCodigoDeBarra());
        productoActual.setStockMin(productoDto.getStockMin());
        productoActual.setNombre(productoDto.getNombre());
        productoActual.setProveedor(mapsDtosEntityService.mapToEntityProveedor(productoDto.getProveedor()));
        productoActual.setImagen(productoDto.getImagen());
        productoActual.setCategoria(mapsDtosEntityService.mapToEntityCategoria(productoDto.getCategoria()));
        productoRepository.save(productoActual);
        return productoActual;
    }

    public Producto editarProductoPorId(Long id, ProductoDto productoDto) {
        Optional<Producto> productoOpt = productoRepository.findById(id);
        
        if (productoOpt.isPresent()) {
            Producto productoActual = productoOpt.get();
            
            // Only update fields that are provided in the DTO
            if (productoDto.getNombre() != null) {
                productoActual.setNombre(productoDto.getNombre());
            }
            if (productoDto.getPrecioVenta() != 0) {
                productoActual.setPrecioVenta(productoDto.getPrecioVenta());
            }
            if (productoDto.getStockMin() != 0) {
                productoActual.setStockMin(productoDto.getStockMin());
            }
            
            // Update categoria if provided
            if (productoDto.getCategoria() != null) {
                productoActual.setCategoria(mapsDtosEntityService.mapToEntityCategoria(productoDto.getCategoria()));
            }
            
            // Update proveedor if provided
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

    public ProductoDto buscarPorCodigoBarras(String codigoBarras) {
        Optional<Producto> producto = productoRepository.findByCodigoDeBarraAndActivoTrue(codigoBarras);
        if (producto.isPresent()) {
            return mapsDtosEntityService.mapToDtoProductoSimple(producto.get());
        }
        return null;
    }

}




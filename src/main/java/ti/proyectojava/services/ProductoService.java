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
    }

    public String crearProducto(ProductoDto productoDto) {
        return "Producto creado. ID:" + productoRepository.save(mapsDtosEntityService.mapToEntityProducto(productoDto)).getId();
    }

    public ProductoDto buscaProducto(Long id) {
        Optional<Producto> aux = productoRepository.findById(id);
        if(aux.isPresent()){
            return mapsDtosEntityService.mapToDtoProducto(aux.get());
        }
        return null;
    }

    public Producto editarProducto(Producto productoActual, ProductoDto productoDto) {

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




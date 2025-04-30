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
    private final MapsDtosEntityService mapsDtosEntityService;

    public ProductoService(ProductoRepository productoRepository, MapsDtosEntityService mapsDtosEntityService) {
        this.productoRepository = productoRepository;
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
    public String crearProducto(ProductoDto productoDto) {
        return "Producto creado. ID:" + productoRepository.save(mapsDtosEntityService.mapToEntityProducto(productoDto)).getId();
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
        productoActual.setCombos(mapsDtosEntityService.mapToEntityProducto(productoDto).getCombos());
        productoActual.setNombre(productoDto.getNombre());
        productoActual.setProveedor(mapsDtosEntityService.mapToEntityProducto(productoDto).getProveedor());
        productoActual.setLotes(mapsDtosEntityService.mapToEntityProducto(productoDto).getLotes());
        productoActual.setPromociones(mapsDtosEntityService.mapToEntityProducto(productoDto).getPromociones());
        productoActual.setImagen(productoDto.getImagen());
        productoActual.setDescuentos(mapsDtosEntityService.mapToEntityProducto(productoDto).getDescuentos());
        productoActual.setCategoria(mapsDtosEntityService.mapToEntityProducto(productoDto).getCategoria());
        productoActual.setProveedor(mapsDtosEntityService.mapToEntityProducto(productoDto).getProveedor());
        productoActual.setCantidades(mapsDtosEntityService.mapToEntityProducto(productoDto).getCantidades());

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


}




package ti.proyectojava.api.controllers;

import io.swagger.v3.oas.annotations.Operation;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import ti.proyectojava.api.responses.ResponseListadoProductos;
import ti.proyectojava.business.entities.Producto;
import ti.proyectojava.dtos.ProductoDto;
import ti.proyectojava.services.ProductoService;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping(value = "api/v1/producto")
public class ProductoController {

    private final ProductoService productoService;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }


    @PostMapping("/crear-dto")
    @Secured({"ADMIN"})
    @Operation(description = "Esta Funcion crea un nuevo producto usando ProductoDto completo")
    public ResponseEntity<String> crearProductoConDto(@RequestBody ProductoDto productoDto) {
        try {
            if (productoDto.getNombre() == null || productoDto.getNombre().trim().isEmpty()) {
                return new ResponseEntity<>("El nombre del producto es obligatorio", HttpStatus.BAD_REQUEST);
            }

            if (productoDto.getPrecioVenta() <= 0) {
                return new ResponseEntity<>("El precio de venta debe ser mayor a 0", HttpStatus.BAD_REQUEST);
            }

            if (productoDto.getCodigoDeBarra() == null || productoDto.getCodigoDeBarra().trim().isEmpty()) {
                return new ResponseEntity<>("El código de barras es obligatorio", HttpStatus.BAD_REQUEST);
            }

            productoDto.setId(null);
            productoDto.setActivo(true);

            String response = productoService.crearProducto(productoDto);
            return new ResponseEntity<>(response, HttpStatus.CREATED);

        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            String mensaje = e.getMessage();

            if (mensaje.contains("PRIMARY") || mensaje.contains("primary")) {
                return new ResponseEntity<>("Error: Conflicto de ID de producto. Intente nuevamente", HttpStatus.BAD_REQUEST);
            } else {
                return new ResponseEntity<>("Error de integridad de datos: " + mensaje, HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            return new ResponseEntity<>("Error al crear producto: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }


    @GetMapping("/{id}/imagen")
    @Secured({"ADMIN", "CAJERO"})
    @Operation(description = "Obtiene la imagen de un producto")
    public ResponseEntity<byte[]> obtenerImagenProducto(@PathVariable Long id) {
        try {
            byte[] imagen = productoService.obtenerImagenProducto(id);
            if (imagen != null && imagen.length > 0) {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.IMAGE_JPEG);
                headers.setContentLength(imagen.length);
                return new ResponseEntity<>(imagen, headers, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping(value = "/{id}/imagen", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Secured({"ADMIN"})
    @Operation(description = "Actualiza la imagen de un producto")
    public ResponseEntity<String> actualizarImagenProducto(@PathVariable Long id, @RequestParam("imagen") MultipartFile imagen) {

        try {
            if (imagen.isEmpty()) {
                return new ResponseEntity<>("No se proporcionó ninguna imagen", HttpStatus.BAD_REQUEST);
            }

            String response = productoService.actualizarImagenProducto(id, imagen.getBytes());
            return new ResponseEntity<>(response, HttpStatus.OK);

        } catch (IOException e) {
            return new ResponseEntity<>("Error al procesar la imagen: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("Error al actualizar imagen: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }


    @GetMapping("/{id}")
    @Secured({"ADMIN", "CAJERO"})
    @Operation(description = "Esta Funcion obtiene un producto por su ID")
    public ResponseEntity<ProductoDto> obtenerProducto(@PathVariable Long id) {
        try {
            ProductoDto producto = productoService.buscaProducto(id);
            return ResponseEntity.ok(producto);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @PutMapping("/{id}/editar")
    @Secured({"ADMIN"})
    @Operation(description = "Esta Funcion edita un producto")
    public ResponseEntity<String> EditarProducto(@PathVariable Long id, @RequestBody ProductoDto productoDto) {
        try {
            Producto producto = productoService.editarProductoPorId(id, productoDto);

            if (producto == null) {
                return new ResponseEntity<>("Producto no encontrado. ID:" + id, HttpStatus.NOT_FOUND);
            } else {
                return new ResponseEntity<>("Producto actualizado correctamente. ID:" + producto.getId(), HttpStatus.OK);
            }
        } catch (Exception e) {
            return new ResponseEntity<>("Error al editar el producto: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @PutMapping("/{id}/eliminar")
    @Secured({"ADMIN"})
    @Operation(description = "Esta Funcion elimina un producto")
    public ResponseEntity<String> borrarProducto(@PathVariable Long id) {
        try {
            String response = productoService.borrarProducto(id);

            if (response != null) {
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                return new ResponseEntity<>("Producto no encontrado. ID:" + id, HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>("Error al eliminar el producto: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/listar")
    @Secured({"ADMIN", "CAJERO"})
    @Operation(description = "Esta funcion lista los productos")
    public ResponseEntity<ResponseListadoProductos> getProductos() {
        ResponseListadoProductos response = productoService.listadoProductos();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/buscar/codigo/todos/{codigoBarras}")
    @Secured({"ADMIN", "CAJERO"})
    @Operation(description = "Esta funcion busca todos los productos con el mismo código de barras")
    public ResponseEntity<List<ProductoDto>> buscarTodosPorCodigoBarras(@PathVariable String codigoBarras) {
        List<ProductoDto> productos = productoService.buscarTodosPorCodigoBarras(codigoBarras);
        if (!productos.isEmpty()) {
            return new ResponseEntity<>(productos, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/top")
    @Secured({"ADMIN", "CAJERO"})
    @Operation(description = "Esta funcion lista los top N productos más vendidos")
    public ResponseEntity<ResponseListadoProductos> getTopProductos(@RequestParam int n) {
        ResponseListadoProductos response = productoService.listadoProductosTop(n);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/paginado")
    @Secured({"ADMIN", "CAJERO"})
    @Operation(description = "Esta función lista los productos de forma paginada y ordenada alfabéticamente con filtros")
    public ResponseEntity<Page<ProductoDto>> productosPaginado(
            @RequestParam("pagina") Integer pagina,
            @RequestParam("cantidad") Integer cantidad,
            @RequestParam(value = "busqueda", required = false) String busqueda,
            @RequestParam(value = "categoria", required = false) Long categoriaId) {
        return new ResponseEntity<>(productoService.listadoProductosPageConFiltros(pagina, cantidad, busqueda, categoriaId), HttpStatus.OK);
    }

    @PutMapping("/{id}/stock")
    @Secured({"ADMIN"})
    @Operation(description = "Esta función permite modificar el stock total de un producto (solo admin supremo)")
    public ResponseEntity<String> modificarStockTotal(@PathVariable Long id, @RequestBody Integer nuevoStockTotal) {
        try {
            productoService.modificarStockTotal(id, nuevoStockTotal);
            return new ResponseEntity<>("Stock modificado correctamente", HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("Error interno del servidor", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}

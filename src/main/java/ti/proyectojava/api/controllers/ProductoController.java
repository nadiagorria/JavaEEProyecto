package ti.proyectojava.api.controllers;

import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import ti.proyectojava.api.responses.ResponseListadoProductos;
import ti.proyectojava.api.responses.ResponseListadoUsuarios;
import ti.proyectojava.business.entities.Producto;
import ti.proyectojava.dtos.ProductoDto;
import ti.proyectojava.services.ProductoService;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping(value = "api/v1/producto")
public class ProductoController {

    private final ProductoService productoService;
    private Producto productoActual;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
        this.productoActual = null;
    }

    //solo admin puede hacerlo
    @PostMapping(value = "/crear", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Secured({"ADMIN"})
    @Operation(description = "Esta Funcion crea un nuevo producto con imagen")
    public ResponseEntity<String> crearProductoConImagen(
            @RequestParam("nombre") String nombre,
            @RequestParam("precioCompra") float precioCompra,
            @RequestParam("precioVenta") float precioVenta,
            @RequestParam("codigoDeBarra") String codigoDeBarra,
            @RequestParam("stockMin") int stockMin,
            @RequestParam("stockTotal") int stockTotal,
            @RequestParam(value = "categoriaId", required = false) Long categoriaId,
            @RequestParam(value = "proveedorId", required = false) Long proveedorId,
            @RequestParam(value = "imagen", required = false) MultipartFile imagen) {
          try {
            ProductoDto productoDto = new ProductoDto();
            productoDto.setId(null); // Asegurar que el ID sea null para autogeneración
            productoDto.setNombre(nombre);
            productoDto.setPrecioCompra(precioCompra);
            productoDto.setPrecioVenta(precioVenta);
            productoDto.setCodigoDeBarra(codigoDeBarra);
            productoDto.setStockMin(stockMin);
            productoDto.setStockTotal(stockTotal);
            productoDto.setActivo(true);
            
            // Si se proporciona una imagen, convertirla a byte array
            if (imagen != null && !imagen.isEmpty()) {
                productoDto.setImagen(imagen.getBytes());
            }
            
            String response = productoService.crearProductoConImagen(productoDto, categoriaId, proveedorId);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
              } catch (IOException e) {
            return new ResponseEntity<>("Error al procesar la imagen: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            String mensaje = e.getMessage();
            if (mensaje.contains("codigo") || mensaje.contains("CODIGO")) {
                return new ResponseEntity<>("Error: Ya existe un producto con ese código de barras", HttpStatus.BAD_REQUEST);
            } else if (mensaje.contains("PRIMARY") || mensaje.contains("primary")) {
                return new ResponseEntity<>("Error: Conflicto de ID de producto. Intente nuevamente", HttpStatus.BAD_REQUEST);
            } else {
                return new ResponseEntity<>("Error de integridad de datos: " + mensaje, HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            return new ResponseEntity<>("Error al crear producto: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }


    //solo admin puede hacerlo - endpoint principal para JSON con DTO completo
    @PostMapping("/crear-dto")
    @Secured({"ADMIN"})
    @Operation(description = "Esta Funcion crea un nuevo producto usando ProductoDto completo")
    public ResponseEntity<String> crearProductoConDto(@RequestBody ProductoDto productoDto) {
        try {
            // Validaciones básicas
            if (productoDto.getNombre() == null || productoDto.getNombre().trim().isEmpty()) {
                return new ResponseEntity<>("El nombre del producto es obligatorio", HttpStatus.BAD_REQUEST);
            }
            
            if (productoDto.getPrecioVenta() <= 0) {
                return new ResponseEntity<>("El precio de venta debe ser mayor a 0", HttpStatus.BAD_REQUEST);
            }
            
            if (productoDto.getCodigoDeBarra() == null || productoDto.getCodigoDeBarra().trim().isEmpty()) {
                return new ResponseEntity<>("El código de barras es obligatorio", HttpStatus.BAD_REQUEST);
            }
            
            // Asegurar que el ID sea null para autogeneración
            productoDto.setId(null);
            productoDto.setActivo(true);
            
            String response = productoService.crearProducto(productoDto);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
            
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            String mensaje = e.getMessage();
            if (mensaje.contains("codigo") || mensaje.contains("CODIGO")) {
                return new ResponseEntity<>("Error: Ya existe un producto con ese código de barras", HttpStatus.BAD_REQUEST);
            } else if (mensaje.contains("PRIMARY") || mensaje.contains("primary")) {
                return new ResponseEntity<>("Error: Conflicto de ID de producto. Intente nuevamente", HttpStatus.BAD_REQUEST);
            } else {
                return new ResponseEntity<>("Error de integridad de datos: " + mensaje, HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            return new ResponseEntity<>("Error al crear producto: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    //solo admin puede hacerlo - endpoint original para JSON
    @PostMapping("/crear-json")
    @Secured({"ADMIN"})
    @Operation(description = "Esta Funcion crea un nuevo producto (JSON) - DEPRECATED: usar /crear-dto")
    public ResponseEntity<String> crearProducto(@RequestBody ProductoDto productoDto) {
        String response = productoService.crearProducto(productoDto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // Endpoint para obtener la imagen de un producto
    @GetMapping("/{id}/imagen")
    @Secured({"ADMIN", "CAJERO"})
    @Operation(description = "Obtiene la imagen de un producto")
    public ResponseEntity<byte[]> obtenerImagenProducto(@PathVariable Long id) {
        try {
            byte[] imagen = productoService.obtenerImagenProducto(id);
            if (imagen != null && imagen.length > 0) {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.IMAGE_JPEG); // Asumimos JPEG por defecto
                headers.setContentLength(imagen.length);
                return new ResponseEntity<>(imagen, headers, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Endpoint para actualizar solo la imagen de un producto
    @PutMapping(value = "/{id}/imagen", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Secured({"ADMIN"})
    @Operation(description = "Actualiza la imagen de un producto")
    public ResponseEntity<String> actualizarImagenProducto(
            @PathVariable Long id,
            @RequestParam("imagen") MultipartFile imagen) {
        
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

    //cualquiera puede usarlo
    @PostMapping("/seleccionar")
    @Secured({"ADMIN", "CAJERO"})
    @Operation(description =  "Esta funcion selecciona un nuevo producto")
    public ResponseEntity<String> seleccionarNotificacion(@RequestBody Long id) {
        ProductoDto producto = productoService.buscaProducto(id);

        if (producto == null) {
            return new ResponseEntity<>("No se encontró el producto. ID:" + producto.getId(), HttpStatus.NOT_FOUND);
        }


        return new ResponseEntity<>("producto actual actualizado. ID:" + producto.getId(), HttpStatus.OK);
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

    //solo admin puede usarlo
    @PutMapping("/{id}/editar")
    @Secured({"ADMIN"})
    @Operation(description = "Esta Funcion edita un producto")
    public ResponseEntity<String> EditarProducto(@PathVariable Long id, @RequestBody ProductoDto productoDto) {
        try {
            Producto producto = productoService.editarProductoPorId(id, productoDto);

            if (producto == null){
                return new ResponseEntity<>("Producto no encontrado. ID:" + id, HttpStatus.NOT_FOUND);
            } else {
                return new ResponseEntity<>("Producto actualizado correctamente. ID:" + producto.getId(), HttpStatus.OK);
            }
        } catch (Exception e) {
            return new ResponseEntity<>("Error al editar el producto: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }    //solo admin puede usarlo
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

    //todos pueden usarla
    @GetMapping("/listar")
    @Secured({"ADMIN", "CAJERO"})
    @Operation(description = "Esta funcion lista los productos")
    public ResponseEntity<ResponseListadoProductos> getProductos() {
        ResponseListadoProductos response = productoService.listadoProductos();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    //todos pueden usarla
    @GetMapping("/buscar/codigo/{codigoBarras}")
    @Secured({"ADMIN", "CAJERO"})
    @Operation(description = "Esta funcion busca un producto por su código de barras")
    public ResponseEntity<ProductoDto> buscarPorCodigoBarras(@PathVariable String codigoBarras) {
        ProductoDto producto = productoService.buscarPorCodigoBarras(codigoBarras);
        if (producto != null) {
            return new ResponseEntity<>(producto, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    //todos pueden usarla
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

    // Solo admin supremo (exclusivamente ADMIN) puede modificar stock total
    @PutMapping("/{id}/stock")
    @Secured({"ADMIN"})
    @Operation(description = "Esta función permite modificar el stock total de un producto (solo admin supremo)")
    public ResponseEntity<String> modificarStockTotal(
            @PathVariable Long id, 
            @RequestBody Integer nuevoStockTotal) {
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

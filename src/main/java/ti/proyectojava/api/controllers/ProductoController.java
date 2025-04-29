package ti.proyectojava.api.controllers;

import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import ti.proyectojava.api.responses.ResponseListadoProductos;
import ti.proyectojava.api.responses.ResponseListadoUsuarios;
import ti.proyectojava.business.entities.Producto;
import ti.proyectojava.dtos.ProductoDto;
import ti.proyectojava.services.ProductoService;

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
    @PostMapping("/crear")
    @Secured({"ADMIN"})
    @Operation(description = "Esta Funcion crea un nuevo producto")
    public ResponseEntity<String> crearProducto(@RequestBody ProductoDto productoDto) {
        String response = productoService.crearProducto(productoDto);

        if (response == null) {
            return new ResponseEntity<>("Error al crear producto. ID:" + productoDto.getId(), HttpStatus.BAD_REQUEST);
        } else {
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        }
    }

    //cualquiera puede usarlo
    @PostMapping("/seleccionar")
    @Secured({"ADMIN", "CAJERO"})
    @Operation(description =  "Esta funcion selecciona un nuevo producto")
    public ResponseEntity<String> seleccionarNotificacion(@RequestBody Long id) {
        Producto producto = productoService.buscaProducto(id);

        if (producto == null) {
            return new ResponseEntity<>("No se encontró el producto. ID:" + producto.getId(), HttpStatus.NOT_FOUND);
        }

        this.productoActual = producto;

        return new ResponseEntity<>("producto actual actualizado. ID:" + producto.getId(), HttpStatus.OK);
    }


    //solo admin puede usarlo
    @PutMapping("/{id}/editar")
    @Secured({"ADMIN"})
    @Operation(description = "Esta Funcion edita un producto")
    public ResponseEntity<String> EditarProducto(@RequestBody ProductoDto productoDto) {
        Producto producto = productoService.editarProducto(this.productoActual, productoDto);

        this.productoActual = producto;

        return new ResponseEntity<>("producto actual actualizado. ID:" + producto.getId(), HttpStatus.OK);

    }

    //solo admin puede usarlo
    @PutMapping("/{id}/eliminar")
    @Secured({"ADMIN"})
    @Operation(description = "Esta Funcion elimina un producto")
    public ResponseEntity<String> borrarProducto(/*@RequestBody Long id*/) {
        String response = productoService.borrarProducto(this.productoActual.getId());

        this.productoActual = null; //inchequeable

        return new ResponseEntity<> (response, HttpStatus.OK);
    }

    //todos pueden usarla
    @GetMapping("/listar")
    @Secured({"ADMIN", "CAJERO"})
    @Operation(description = "Esta funcion lista los productos")
    public ResponseEntity<ResponseListadoProductos> getProductos() {
        ResponseListadoProductos response = productoService.listadoProductos();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }



}

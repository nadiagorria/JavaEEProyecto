package ti.proyectojava.api.controllers;

import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
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

    @PostMapping("/crear")
    @Operation(description = "Esta Funcion crea un nuevo producto")
    public ResponseEntity<String> crearProducto(@RequestBody ProductoDto productoDto){
        String response = productoService.crearProducto(productoDto);

        if (response == null) {
            return new ResponseEntity<>("Error al crear producto", HttpStatus.BAD_REQUEST);
        } else {
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        }
    }

    @PostMapping("/seleccionar")
    @Operation(description =  "Esta funcion selecciona un nuevo producto")
    public ResponseEntity<String> seleccionarNotificacion(@RequestBody Long id){
        Producto producto = productoService.buscaProducto(id);

        if (producto == null) {
            return new ResponseEntity<>("No se encontró el producto #" + producto.getId(), HttpStatus.NOT_FOUND);
        }

        this.productoActual = producto;

        return new ResponseEntity<>("producto actual actualizado #" + producto.getId(), HttpStatus.OK);
    }


    @PutMapping("/{id}/editar")
    @Operation(description = "Esta Funcion edita un producto")
    public ResponseEntity<String> EditarProducto(@RequestBody ProductoDto productoDto){
        Producto producto = productoService.editarProducto(this.productoActual, productoDto);

        this.productoActual = producto;

        return new ResponseEntity<>("producto actual actualizado #" + producto.getId(), HttpStatus.OK);

    }

    @PutMapping("/{id}/eliminar")
    @Operation(description = "Esta Funcion elimina un producto")
    public ResponseEntity<String> borrarProducto(/*@RequestBody Long id*/){
        Producto producto = productoService.borrarProducto(this.productoActual);

        this.productoActual = null; //inchequeable

        
        return new ResponseEntity<>("producto actual eliminada #" + producto.getId(), HttpStatus.OK);

    }

}

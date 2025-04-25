package ti.proyectojava.api.controllers;


import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ti.proyectojava.business.entities.Venta;
import ti.proyectojava.dtos.VentaDto;
import ti.proyectojava.services.VentaService;

@RestController
@RequestMapping(value = "api/v1/venta")
public class VentaController {

    private final VentaService ventaService;
    private Venta ventaActual;

    public VentaController(VentaService ventaService) {
        this.ventaService = ventaService;
        this.ventaActual = null;
    }

    @PostMapping("/crear")
    @Operation(description = "Esta Funcion crea una nueva Venta")
    public ResponseEntity<String> crearVenta(@RequestBody VentaDto ventaDto) {
        String response = ventaService.crearventa(ventaDto);

        if (response == null) {
            return new ResponseEntity<>("Error al crear Venta. ID:" + ventaDto.getId(), HttpStatus.BAD_REQUEST);
        } else {
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        }
    }

    @PutMapping("/{id}/eliminar")
    @Operation(description = "Esta Funcion elimina un producto")
    public ResponseEntity<String> eliminarVenta(/*@RequestBody Long id*/) {
        Venta venta = ventaService.eliminarVenta(this.ventaActual);

        this.ventaActual = null; //inchequeable


        return new ResponseEntity<>("venta actual eliminada. ID:" + venta.getId(), HttpStatus.OK);

    }

    @PutMapping("/{ventaId}/agregar-producto")
    @Operation(description = "Agrega un producto a una venta existente")
    public ResponseEntity<String> agregarProductoAVenta(@RequestParam Long ventaId, @RequestParam Long productoId,@RequestParam int cantidad) {
        try {
            ventaService.agregarProductoAVenta(ventaId, productoId, cantidad);
            return new ResponseEntity<>("Producto agregado a la venta. ID:" + ventaId, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Error: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }

    }
}

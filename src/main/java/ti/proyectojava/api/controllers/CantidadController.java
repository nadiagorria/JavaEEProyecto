package ti.proyectojava.api.controllers;

import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import ti.proyectojava.api.responses.ResponseListadoCantidades;
import ti.proyectojava.dtos.CantidadDto;
import ti.proyectojava.services.CantidadService;

@RestController
@RequestMapping(value = "api/v1/cantidades")
public class CantidadController {

    private final CantidadService cantidadService;

    public CantidadController(CantidadService cantidadService) {
        this.cantidadService = cantidadService;
    }

    // esto se hace cuando se va creando una venta, no creo que realmente tenga un controller para si mismo
    @PostMapping
    @Secured({"ADMIN", "CAJERO"})
    @Operation(description = "Esta funcion crea una nueva cantidad")
    public ResponseEntity<String> createCantidad(@RequestBody CantidadDto cantidadDto){
        String response = cantidadService.crearCantidad(cantidadDto);
        if (response == null){
            return new ResponseEntity<>("Error al crear cantidad. ID:" + cantidadDto.getId(), HttpStatus.BAD_REQUEST);
        }else {
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        }
    }

    // esta funcion se usa cuando se entra a ver informacion de una venta.
    // hay que modificarla para que se haga solo por venta
    @GetMapping
    @Secured({"ADMIN", "CAJERO"})
    @Operation(description = "Esta funcion lista las cantidades")
    public ResponseEntity<ResponseListadoCantidades> getCantidades(){
        ResponseListadoCantidades response = cantidadService.listadoCantidades();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    //no creo que sea necesario un controller, solo se puede borrar cuando se esta haciendo una compra
    // y se desea borrar la linea

    @PutMapping("/eliminar/{id}")
    @Secured({"ADMIN", "CAJERO"})
    @Operation(description = "Esta funcion borra una cantidad")
    public ResponseEntity<Void> borrarCantidad(@PathVariable (name = "id") Long id){
        cantidadService.borrarCantidad(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }

}

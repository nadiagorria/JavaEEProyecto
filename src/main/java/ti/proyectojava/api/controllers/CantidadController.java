package ti.proyectojava.api.controllers;

import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

    @PostMapping
    @Operation(description = "Esta funcion crea una nueva cantidad")
    public ResponseEntity<String> createCantidad(@RequestBody CantidadDto cantidadDto){
        String response = cantidadService.crearCantidad(cantidadDto);
        if (response == null){
            return new ResponseEntity<>("Error al crear categoria", HttpStatus.BAD_REQUEST);
        }else {
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        }
    }

    @GetMapping
    @Operation(description = "Esta funcion lista las cantidades")
    public ResponseEntity<ResponseListadoCantidades> getCantidades(){
        ResponseListadoCantidades response = cantidadService.listadoCantidades();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/eliminar/{id}")
    @Operation(description = "Esta funcion borra una cantidad")
    public ResponseEntity<Void> borrarCantidad(@PathVariable (name = "id") Long id){
        cantidadService.borrarCantidad(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }

}

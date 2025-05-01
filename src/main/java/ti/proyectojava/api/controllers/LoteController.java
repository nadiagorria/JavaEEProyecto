package ti.proyectojava.api.controllers;

import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import ti.proyectojava.dtos.LoteDto;
import ti.proyectojava.services.LoteService;

@RestController
@RequestMapping(value = "api/v1/lote")
public class LoteController {
    private final LoteService loteService;


    public LoteController(LoteService loteService, LoteService loteService1) {
        this.loteService = loteService1;
    }

    //solo puede usarlo un admin
    @PostMapping("/crear")
    @Secured({"ADMIN"})
    @Operation(description = "Esta Funcion crea una nuevo lote")
    public ResponseEntity<String> crearLote(@RequestBody LoteDto loteDto) {
        String response = loteService.crearLote(loteDto);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    //solo puede usarlo un admin
    @PutMapping("/{id}/eliminar")
    @Secured({"ADMIN"})
    @Operation(description = "Esta Funcion elimina un lote")
    public ResponseEntity<String> borrarLote(@RequestBody Long id){
        String lote = loteService.borrarLote(id);

        if (lote == null) {
            return new ResponseEntity<>("No se encontró el lote. ID:" + id, HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity<>(lote, HttpStatus.OK);

    }


}

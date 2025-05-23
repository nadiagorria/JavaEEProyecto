package ti.proyectojava.api.controllers;

import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import ti.proyectojava.api.responses.ResponseListadoCreditos;
import ti.proyectojava.business.entities.Credito;
import ti.proyectojava.dtos.CreditoDto;
import ti.proyectojava.services.CreditoService;

@RestController
@RequestMapping(value = "api/v1/creditos")
public class CreditoController {

    private final CreditoService creditoService;

    public CreditoController(CreditoService creditoService) {
        this.creditoService = creditoService;
    }

    //solo la puede usar un admin
    @PostMapping
    @Secured({"ADMIN"})
    @Operation(description = "Esta funcion crea un nuevo credito")
    public ResponseEntity<String> createCantidad(@RequestBody CreditoDto creditoDto){
        String response = creditoService.crearCredito(creditoDto);
        if (response == null){
            return new ResponseEntity<>("Error al crear credito. ID:" + creditoDto.getId(), HttpStatus.BAD_REQUEST);
        }else {
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        }
    }


    //la puede usar cualquiera
    @PostMapping("/credito/{id}/pagar")
    @Secured({"ADMIN", "CAJERO"})
    public ResponseEntity<String> pagarCredito( @PathVariable("id") Long id, @RequestParam("pago") Float pago) {
        String response = creditoService.pagarCredito(id, pago);
        return new ResponseEntity<>(response, HttpStatus.OK);

    }

    @GetMapping("/listar")
    @Secured({"ADMIN", "CAJERO"})
    @Operation(description = "Esta función lista todos los créditos activos")
    public ResponseEntity<ResponseListadoCreditos> listarCreditos() {
        ResponseListadoCreditos response = creditoService.listarCreditos();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

}

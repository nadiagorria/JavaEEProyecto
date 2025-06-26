package ti.proyectojava.api.controllers;

import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import ti.proyectojava.api.responses.ResponseListadoCreditos;
import ti.proyectojava.services.CreditoService;

@RestController
@RequestMapping(value = "api/v1/creditos")
public class CreditoController {

    private final CreditoService creditoService;

    public CreditoController(CreditoService creditoService) {
        this.creditoService = creditoService;
    }


    @PostMapping("/credito/{id}/pagar")
    @Secured({"ADMIN", "CAJERO"})
    public ResponseEntity<String> pagarCredito(@PathVariable("id") Long id, @RequestParam("pago") Float pago) {
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

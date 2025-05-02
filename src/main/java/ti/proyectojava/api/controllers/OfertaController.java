package ti.proyectojava.api.controllers;

import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import ti.proyectojava.api.responses.ResponseListadoCombos;
import ti.proyectojava.api.responses.ResponseListadoDescuentos;
import ti.proyectojava.api.responses.ResponseListadoProductos;
import ti.proyectojava.api.responses.ResponseListadoPromociones;
import ti.proyectojava.dtos.ComboDto;
import ti.proyectojava.dtos.DescuentoDto;
import ti.proyectojava.dtos.PromocionDto;
import ti.proyectojava.business.entities.Oferta;
import ti.proyectojava.services.OfertaService;

@RestController
@RequestMapping(value = "api/v1/oferta")
public class OfertaController {

    private final OfertaService ofertaService;

    public OfertaController(OfertaService ofertaService) {
        this.ofertaService = ofertaService;
    }

    ////////////////////// COMBO //////////////////////

    //solo admin puede hacerlo
    @PostMapping("/combo")
    @Secured({"ADMIN"})
    @Operation(description = "Crea un nuevo Combo")
    public ResponseEntity<String> crearCombo(@RequestBody ComboDto comboDto) {
        String response = ofertaService.crearCombo(comboDto);
        return response == null ?
                new ResponseEntity<>("Error al crear Combo. ID:" + comboDto.getId(), HttpStatus.BAD_REQUEST) :
                new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    //solo admin puede hacerlo (no es necesaria esta funcion, creo que podemos sacarla)
    @PutMapping("/editarcombo")
    @Secured({"ADMIN"})
    @Operation(description = "Edita un Combo existente")
    public ResponseEntity<String> editarCombo(@RequestBody ComboDto comboDto) {
        return ResponseEntity.ok(ofertaService.editarCombo(comboDto));
    }

    //todos pueden usarla
    @GetMapping("/listarCombo")
    @Secured({"ADMIN", "CAJERO"})
    @Operation(description = "Esta funcion lista los combos")
    public ResponseEntity<ResponseListadoCombos> getCombos() {
        ResponseListadoCombos response = ofertaService.listadoCombo();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    ////////////////////// DESCUENTO //////////////////////

    //solo puede hacerlo el admin
    @PostMapping("/descuento")
    @Secured({"ADMIN"})
    @Operation(description = "Crea un nuevo Descuento")
    public ResponseEntity<String> crearDescuento(@RequestBody DescuentoDto descuentoDto) {
        String response = ofertaService.crearDescuento(descuentoDto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    //solo admin puede hacerlo (no es necesaria esta funcion, creo que podemos sacarla)
    @PutMapping("/editardescuento")
    @Secured({"ADMIN"})
    @Operation(description = "Edita un Descuento existente")
    public ResponseEntity<String> editarDescuento(@RequestBody DescuentoDto descuentoDto) {
        return ResponseEntity.ok(ofertaService.editarDescuento(descuentoDto));
    }

    //todos pueden usarla
    @GetMapping("/listarDescuentos")
    @Secured({"ADMIN", "CAJERO"})
    @Operation(description = "Esta funcion lista los descuentos")
    public ResponseEntity<ResponseListadoDescuentos> getDescuentos() {
        ResponseListadoDescuentos response = ofertaService.listadoDescuentos();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    ////////////////////// PROMOCIÓN //////////////////////

    //solo admin puede hacerlo
    @PostMapping("/promocion")
    @Secured({"ADMIN"})
    @Operation(description = "Crea una nueva Promoción")
    public ResponseEntity<String> crearPromocion(@RequestBody PromocionDto promocionDto) {
        String response = ofertaService.crearPromocion(promocionDto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    //solo admin puede hacerlo (no es necesaria esta funcion, creo que podemos sacarla)
    @PutMapping("/editarpromocion")
    @Secured({"ADMIN"})
    @Operation(description = "Edita una Promoción existente")
    public ResponseEntity<String> editarPromocion(@RequestBody PromocionDto promocionDto) {
        return ResponseEntity.ok(ofertaService.editarPromocion(promocionDto));
    }

    //todos pueden usarla
    @GetMapping("/listarPromociones")
    @Secured({"ADMIN", "CAJERO"})
    @Operation(description = "Esta funcion lista las promociones")
    public ResponseEntity<ResponseListadoPromociones> getPromociones() {
        ResponseListadoPromociones response = ofertaService.listadoPromociones();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    ////////////////////// ELIMINAR OFERTA //////////////////////

    //solo admin puede hacerlo
    @PutMapping("/eliminar")
    @Secured({"ADMIN"})
    @Operation(description = "Elimina (lógicamente) una Oferta")
    public ResponseEntity<String> eliminarOferta(@RequestBody Long id) {
        String response = ofertaService.eliminarOferta(id);

        return ResponseEntity.ok(response);
    }
}
